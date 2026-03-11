package com.CabBooking.cabbooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    private String pickupLocation;
    private String dropoffLocation;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;

    private String vehicleType;

    private Double fare;
    private Double distance;

    @Enumerated(EnumType.STRING)
    private RideStatus status;

    private LocalDateTime requestTime;
    private LocalDateTime acceptTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @OneToOne(mappedBy = "ride", cascade = CascadeType.ALL)
    private Payment payment;
}
