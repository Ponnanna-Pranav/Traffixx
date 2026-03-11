package com.CabBooking.cabbooking.service;

import com.CabBooking.cabbooking.dto.ReviewRequest;
import com.CabBooking.cabbooking.entity.Review;
import com.CabBooking.cabbooking.entity.Ride;
import com.CabBooking.cabbooking.entity.User;
import com.CabBooking.cabbooking.repository.ReviewRepository;
import com.CabBooking.cabbooking.repository.RideRepository;
import com.CabBooking.cabbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public Review addReview(ReviewRequest request, String userEmail) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .ride(ride)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .reviewTime(LocalDateTime.now())
                .build();

        return reviewRepository.save(review);
    }

    public List<Review> getRideReviews(Long rideId) {
        return reviewRepository.findByRideId(rideId);
    }

    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId);
    }
}
