package com.CabBooking.cabbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveLocation {
    private Long rideId;
    private Long driverId;
    private Double latitude;
    private Double longitude;
}
