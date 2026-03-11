package com.CabBooking.cabbooking.controller;

import com.CabBooking.cabbooking.dto.RideRequest;
import com.CabBooking.cabbooking.dto.RideResponse;
import com.CabBooking.cabbooking.entity.RideStatus;
import com.CabBooking.cabbooking.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping("/request")
    public ResponseEntity<RideResponse> requestRide(
            @RequestBody RideRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rideService.requestRide(request, email));
    }

    @GetMapping("/available")
    public ResponseEntity<List<RideResponse>> getAvailableRides() {
        return ResponseEntity.ok(rideService.getAvailableRides());
    }

    @PostMapping("/{rideId}/accept")
    public ResponseEntity<RideResponse> acceptRide(
            @PathVariable Long rideId,
            Authentication authentication) {
        String driverEmail = authentication.getName();
        return ResponseEntity.ok(rideService.acceptRide(rideId, driverEmail));
    }

    @PutMapping("/{rideId}/status")
    public ResponseEntity<RideResponse> updateRideStatus(
            @PathVariable Long rideId,
            @RequestParam RideStatus status) {
        return ResponseEntity.ok(rideService.updateRideStatus(rideId, status));
    }

    @GetMapping("/history")
    public ResponseEntity<List<RideResponse>> getRideHistory(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rideService.getRideHistory(email));
    }
}
