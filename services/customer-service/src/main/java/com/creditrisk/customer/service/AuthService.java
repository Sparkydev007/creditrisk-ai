package com.creditrisk.customer.service;

import com.creditrisk.common.exception.ResourceNotFoundException;
import com.creditrisk.customer.dto.*;
import com.creditrisk.customer.entity.*;
import com.creditrisk.customer.repository.*;
import com.creditrisk.customer.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : com.creditrisk.constants.Role.CUSTOMER)
                .build();

        // Create customer if customer role
        if (user.getRole() == com.creditrisk.constants.Role.CUSTOMER &&
            request.getFirstName() != null) {
            Customer customer = Customer.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .dateOfBirth(request.getDateOfBirth())
                    .ssn(request.getSsn())
                    .employmentProfile(EmploymentProfile.builder()
                            .employerName(request.getEmployerName())
                            .jobTitle(request.getJobTitle())
                            .employmentYears(request.getEmploymentYears())
                            .employmentStatus(request.getEmploymentStatus())
                            .annualIncome(request.getAnnualIncome())
                            .build())
                    .financialProfile(FinancialProfile.builder()
                            .creditScore(request.getCreditScore())
                            .existingDebt(request.getExistingDebt())
                            .creditUtilization(request.getCreditUtilization())
                            .paymentHistoryScore(request.getPaymentHistoryScore())
                            .recentInquiries(request.getRecentInquiries())
                            .hasBankruptcy(false)
                            .build())
                    .build();

            customer = customerRepository.save(customer);
            user.setCustomer(customer);
        }

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId(),
                user.getCustomer() != null ? user.getCustomer().getId() : null
        );

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .customerId(user.getCustomer() != null ? user.getCustomer().getId() : null)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId(),
                user.getCustomer() != null ? user.getCustomer().getId() : null
        );

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .customerId(user.getCustomer() != null ? user.getCustomer().getId() : null)
                .build();
    }
}
