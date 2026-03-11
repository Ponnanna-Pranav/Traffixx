package com.CabBooking.cabbooking.service;

import com.CabBooking.cabbooking.entity.Payment;
import com.CabBooking.cabbooking.entity.PaymentStatus;
import com.CabBooking.cabbooking.entity.Ride;
import com.CabBooking.cabbooking.repository.PaymentRepository;
import com.CabBooking.cabbooking.repository.RideRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;

    @Value("${stripe.keys.secret}")
    private String stripeSecretKey;

    public String createPaymentIntent(Long rideId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getPayment() != null && ride.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this ride");
        }

        long amountInCents = Math.round(ride.getFare() * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("rideId", rideId.toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .ride(ride)
                .amount(ride.getFare())
                .stripePaymentIntentId(intent.getId())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        return intent.getClientSecret();
    }

    public void confirmPayment(String intentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(intentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaymentTime(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    public void processUpiPayment(Long rideId, String upiId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getPayment() != null && ride.getPayment().getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this ride");
        }

        Payment payment = Payment.builder()
                .ride(ride)
                .amount(ride.getFare())
                .paymentMethod("UPI - " + upiId)
                .stripePaymentIntentId("upi_" + java.util.UUID.randomUUID().toString())
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentTime(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
    }
}
