package com.CabBooking.cabbooking.dto;

import com.CabBooking.cabbooking.entity.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RideResponse {
    private Long rideId;
    private String pickupLocation;
    private String dropoffLocation;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private Double fare;
    private Double distance;
    private RideStatus status;
    private LocalDateTime requestTime;
    private String vehicleType;

    // Optional driver details if assigned
    private Long driverId;
    private String driverName;
    private String vehiclePlateNumber;
}
