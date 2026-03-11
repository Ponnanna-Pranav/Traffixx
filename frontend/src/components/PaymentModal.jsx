import React, { useState } from 'react';
import client from '../api/client';
import { CreditCard, X, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe using the publishable key from env (or a fallback dummy key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummyKey123');

function PaymentForm({ ride, onDismiss, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [upiId, setUpiId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'card' && (!stripe || !elements)) {
            return; // Stripe.js hasn't loaded yet.
        }

        setLoading(true);
        setStatus('processing');
        setErrorMsg('');

        try {
            if (paymentMethod === 'upi') {
                if (!upiId || !upiId.includes('@')) {
                    throw new Error('Please enter a valid UPI ID (e.g. name@upi)');
                }
                await client.post(`/payments/upi/${ride.rideId}?upiId=${encodeURIComponent(upiId)}`);
                
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                // First step: create payment intent on backend
                const intentRes = await client.post(`/payments/intent/${ride.rideId}`);
                const clientSecret = intentRes.data;

                // Second step: confirm payment with Stripe Elements
                const cardElement = elements.getElement(CardElement);

                const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                    }
                });

                if (error) {
                    setStatus('error');
                    setErrorMsg(error.message || 'Payment failed. Please try again.');
                } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                    // Third step: confirm on backend
                    await client.post(`/payments/confirm?intentId=${paymentIntent.id}`);

                    setStatus('success');
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);
                }
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.response?.data || err.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8">
            <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-blue-100">
                    <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
                <p className="text-gray-500 mt-1">Ride from {ride.pickupLocation} to {ride.dropoffLocation}</p>
            </div>

            {status === 'success' ? (
                <div className="text-center py-6 animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                    <p className="text-gray-500 mt-2">Thank you for riding with CabBook.</p>
                </div>
            ) : (
                <>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                            <span>Fare</span>
                            <span className="font-medium">${ride.fare?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                            <span>Taxes & Fees</span>
                            <span className="font-medium">$2.00</span>
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-2xl text-primary">${((ride.fare || 0) + 2).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('card'); setErrorMsg(''); }} 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentMethod === 'card' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Credit/Debit Card
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setPaymentMethod('upi'); setErrorMsg(''); }} 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentMethod === 'upi' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            UPI
                        </button>
                    </div>

                    {paymentMethod === 'card' ? (
                        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <CardElement options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                            }} />
                        </div>
                    ) : (
                        <div className="mb-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mb-3 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('upi://pay?pa=dummy@upi&pn=CabBooking&am=' + ((ride.fare || 0) + 2).toFixed(2))}`} 
                                    alt="UPI QR Code" 
                                    className="w-40 h-40 object-contain rounded-xl mix-blend-multiply"
                                />
                                <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-1">
                                    <QrCode className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-gray-300"></span>
                                Scan with any UPI app
                                <span className="w-8 h-[1px] bg-gray-300"></span>
                            </p>

                            <div className="w-full">
                                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">Or enter your UPI ID</label>
                                <input 
                                    type="text" 
                                    id="upiId" 
                                    value={upiId} 
                                    onChange={(e) => setUpiId(e.target.value)} 
                                    placeholder="e.g., username@upi" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm font-medium border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <div className="mb-6 flex items-center justify-center text-xs text-gray-500 space-x-1">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>{paymentMethod === 'card' ? 'SSL Secure Stripe Payment' : 'SSL Secure UPI Payment'}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={(paymentMethod === 'card' && !stripe) || loading}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading || status === 'processing' ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay $${((ride.fare || 0) + 2).toFixed(2)}`
                        )}
                    </button>
                </>
            )}
        </form>
    );
}

export default function PaymentModal({ ride, onClose, onSuccess }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative">
                <button onClick={onClose} className="absolute z-10 top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors outline-none">
                    <X className="w-5 h-5" />
                </button>

                <Elements stripe={stripePromise}>
                    <PaymentForm ride={ride} onDismiss={onClose} onSuccess={onSuccess} />
                </Elements>
            </div>
        </div>
    );
}
