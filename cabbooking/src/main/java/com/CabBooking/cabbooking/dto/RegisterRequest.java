package com.CabBooking.cabbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String role; // RIDER, DRIVER, or ADMIN

    // Driver specific
    private String vehicleType;
    private String vehicleModel;
    private String vehiclePlateNumber;
}
