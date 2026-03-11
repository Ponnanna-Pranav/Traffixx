package com.CabBooking.cabbooking.controller;

import com.CabBooking.cabbooking.dto.ReviewRequest;
import com.CabBooking.cabbooking.entity.Review;
import com.CabBooking.cabbooking.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> submitReview(
            @RequestBody ReviewRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reviewService.addReview(request, email));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<List<Review>> getRideReviews(@PathVariable Long rideId) {
        return ResponseEntity.ok(reviewService.getRideReviews(rideId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }
}
