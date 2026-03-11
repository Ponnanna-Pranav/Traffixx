package com.CabBooking.cabbooking.controller;

import com.CabBooking.cabbooking.dto.LiveLocation;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LocationController {

    // Driver sends location to /app/location
    // Riders and admins subscribe to /topic/ride/{rideId}

    @MessageMapping("/location")
    @SendTo("/topic/ride/{rideId}") // Ideally handled dynamically via Interceptors but keeping simple for example
    public LiveLocation broadcastLocation(LiveLocation location) {
        // In a real app we might also save this to a Redis cache or update the Driver
        // entity
        return location;
    }
}
