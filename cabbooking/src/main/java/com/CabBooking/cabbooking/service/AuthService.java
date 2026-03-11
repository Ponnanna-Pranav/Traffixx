package com.CabBooking.cabbooking.service;

import com.CabBooking.cabbooking.dto.AuthenticationRequest;
import com.CabBooking.cabbooking.dto.AuthenticationResponse;
import com.CabBooking.cabbooking.dto.RegisterRequest;
import com.CabBooking.cabbooking.entity.Role;
import com.CabBooking.cabbooking.entity.User;
import com.CabBooking.cabbooking.repository.UserRepository;
import com.CabBooking.cabbooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse register(RegisterRequest request) {
                Role role = Role.valueOf(request.getRole().toUpperCase());

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phoneNumber(request.getPhoneNumber())
                                .role(role)
                                .build();

                if (role == Role.DRIVER) {
                        user.setVehicleType(request.getVehicleType());
                        user.setVehicleModel(request.getVehicleModel());
                        user.setVehiclePlateNumber(request.getVehiclePlateNumber());
                        user.setIsDriverActive(false);
                }

                var savedUser = repository.save(user);
                var jwtToken = jwtUtil.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .userId(savedUser.getId())
                                .name(savedUser.getName())
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole().name())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();

                var jwtToken = jwtUtil.generateToken(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}
