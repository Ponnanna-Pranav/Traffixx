package com.CabBooking.cabbooking.controller;

import com.CabBooking.cabbooking.entity.User;
import com.CabBooking.cabbooking.entity.Ride;
import com.CabBooking.cabbooking.repository.UserRepository;
import com.CabBooking.cabbooking.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final RideRepository rideRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/rides")
    public ResponseEntity<List<Ride>> getAllRides() {
        return ResponseEntity.ok(rideRepository.findAll());
    }
}
