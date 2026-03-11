import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { User, Mail, Lock, Phone, CarFront, UserPlus, FileText } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'RIDER',
        vehicleType: 'BIKE',
        vehicleModel: '',
        vehiclePlateNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await client.post('/auth/register', formData);
            const { token, role } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'RIDER') navigate('/rider');
            else if (role === 'DRIVER') navigate('/driver');

        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full max-w-lg glass rounded-3xl shadow-xl border border-white p-8 relative overflow-hidden my-8">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-white mb-4 shadow-lg">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="text-gray-500 mt-2 font-medium">Join CabBook today and start riding or driving!</p>
                </div>

                {error && (
                    <div className="bg-red-50/80 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input type="text" name="name" onChange={handleChange} required
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input type="email" name="email" onChange={handleChange} required
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input type="password" name="password" onChange={handleChange} required
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="••••••••" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                </div>
                                <input type="tel" name="phoneNumber" onChange={handleChange} required
                                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="+1 234 567 890" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">I want to be a...</label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <label className={`cursor-pointer rounded-xl border-2 p-3 flex items-center justify-center space-x-2 transition-all ${formData.role === 'RIDER' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                <input type="radio" name="role" value="RIDER" checked={formData.role === 'RIDER'} onChange={handleChange} className="hidden" />
                                <User className="w-5 h-5" />
                                <span className="font-semibold">Rider</span>
                            </label>
                            <label className={`cursor-pointer rounded-xl border-2 p-3 flex items-center justify-center space-x-2 transition-all ${formData.role === 'DRIVER' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                <input type="radio" name="role" value="DRIVER" checked={formData.role === 'DRIVER'} onChange={handleChange} className="hidden" />
                                <CarFront className="w-5 h-5" />
                                <span className="font-semibold">Driver</span>
                            </label>
                        </div>
                    </div>

                    {formData.role === 'DRIVER' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    required
                                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="BIKE">Bike</option>
                                    <option value="AUTO">Auto Rickshaw</option>
                                    <option value="CAB">Car / Cab</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Model</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CarFront className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" name="vehicleModel" onChange={handleChange} required
                                            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Toyota Camry" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Plate Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" name="vehiclePlateNumber" onChange={handleChange} required
                                            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="ABC-1234" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 font-medium">Already have an account? </span>
                    <Link to="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
}
