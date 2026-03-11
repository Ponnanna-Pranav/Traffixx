package com.CabBooking.cabbooking.service;

import com.CabBooking.cabbooking.dto.RideRequest;
import com.CabBooking.cabbooking.dto.RideResponse;
import com.CabBooking.cabbooking.entity.Ride;
import com.CabBooking.cabbooking.entity.RideStatus;
import com.CabBooking.cabbooking.entity.User;
import com.CabBooking.cabbooking.repository.RideRepository;
import com.CabBooking.cabbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    private static final double BASE_FARE = 5.0;
    private static final double COST_PER_KM = 1.5;

    public RideResponse requestRide(RideRequest request, String userEmail) {
        User rider = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        // Calculate Distance
        double distance = calculateDistance(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropoffLat(), request.getDropoffLng());

        // Calculate base fare
        double baseCalculatedFare = BASE_FARE + (distance * COST_PER_KM);

        // Apply vehicle multiplier logic (Rapido Clone)
        double fareMultiplier = 1.0;
        String requestedVehicle = request.getVehicleType() != null ? request.getVehicleType().toUpperCase() : "CAB";

        switch (requestedVehicle) {
            case "BIKE":
                fareMultiplier = 0.5; // Bikes are 50% cheaper
                break;
            case "AUTO":
                fareMultiplier = 0.8; // Autos are 20% cheaper
                break;
            case "CAB":
            default:
                fareMultiplier = 1.0;
                break;
        }

        double finalFare = baseCalculatedFare * fareMultiplier;

        Ride ride = Ride.builder()
                .rider(rider)
                .pickupLocation(request.getPickupLocation())
                .dropoffLocation(request.getDropoffLocation())
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .dropoffLat(request.getDropoffLat())
                .dropoffLng(request.getDropoffLng())
                .vehicleType(requestedVehicle) // Persist vehicle type
                .distance(Math.round(distance * 100.0) / 100.0)
                .fare(Math.round(finalFare * 100.0) / 100.0)
                .status(RideStatus.REQUESTED)
                .requestTime(LocalDateTime.now())
                .build();

        Ride savedRide = rideRepository.save(ride);

        return mapToResponse(savedRide);
    }

    public RideResponse acceptRide(Long rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride cannot be accepted");
        }

        ride.setStatus(RideStatus.ACCEPTED);
        ride.setDriver(driver);
        ride.setAcceptTime(LocalDateTime.now());

        return mapToResponse(rideRepository.save(ride));
    }

    public RideResponse updateRideStatus(Long rideId, RideStatus status) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        ride.setStatus(status);
        if (status == RideStatus.IN_PROGRESS) {
            ride.setStartTime(LocalDateTime.now());
        } else if (status == RideStatus.COMPLETED || status == RideStatus.CANCELLED) {
            ride.setEndTime(LocalDateTime.now());
        }

        return mapToResponse(rideRepository.save(ride));
    }

    public List<RideResponse> getAvailableRides() {
        return rideRepository.findByStatus(RideStatus.REQUESTED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RideResponse> getRideHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        List<Ride> rides;

        if ("RIDER".equalsIgnoreCase(user.getRole().name())) {
            rides = rideRepository.findByRiderId(user.getId());
        } else {
            rides = rideRepository.findByDriverId(user.getId());
        }

        return rides.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private RideResponse mapToResponse(Ride ride) {
        RideResponse.RideResponseBuilder builder = RideResponse.builder()
                .rideId(ride.getId())
                .pickupLocation(ride.getPickupLocation())
                .dropoffLocation(ride.getDropoffLocation())
                .pickupLat(ride.getPickupLat())
                .pickupLng(ride.getPickupLng())
                .dropoffLat(ride.getDropoffLat())
                .dropoffLng(ride.getDropoffLng())
                .vehicleType(ride.getVehicleType()) // Expose vehicle type
                .distance(ride.getDistance())
                .fare(ride.getFare())
                .status(ride.getStatus())
                .requestTime(ride.getRequestTime());

        if (ride.getDriver() != null) {
            builder.driverId(ride.getDriver().getId())
                    .driverName(ride.getDriver().getName())
                    .vehiclePlateNumber(ride.getDriver().getVehiclePlateNumber());
        }

        return builder.build();
    }

    // Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
