package com.CabBooking.cabbooking.controller;

import com.CabBooking.cabbooking.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/intent/{rideId}")
    public ResponseEntity<String> createPaymentIntent(@PathVariable Long rideId) {
        try {
            return ResponseEntity.ok(paymentService.createPaymentIntent(rideId));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPayment(@RequestParam String intentId) {
        paymentService.confirmPayment(intentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upi/{rideId}")
    public ResponseEntity<String> processUpiPayment(@PathVariable Long rideId, @RequestParam String upiId) {
        try {
            paymentService.processUpiPayment(rideId, upiId);
            return ResponseEntity.ok("Payment successful");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
