package com.CabBooking.cabbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RideRequest {
    private String pickupLocation;
    private String dropoffLocation;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private String vehicleType; // Added for Rapido (BIKE, AUTO, CAB)
}
