package com.CabBooking.cabbooking.repository;

import com.CabBooking.cabbooking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRideId(Long rideId);

    Optional<Payment> findByStripePaymentIntentId(String intentId);
}
