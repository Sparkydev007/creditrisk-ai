package com.creditrisk.application.controller;

import com.creditrisk.common.dto.PageResponse;
import com.creditrisk.application.dto.*;
import com.creditrisk.application.service.ApplicationServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Credit application management")
public class ApplicationController {

    private final ApplicationServiceImpl applicationService;

    @GetMapping
    @Operation(summary = "Get all applications")
    public ResponseEntity<PageResponse<ApplicationDto>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(applicationService.getApplications(page, size, sortBy, sortDir, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID")
    public ResponseEntity<ApplicationDto> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new credit application")
    public ResponseEntity<ApplicationDto> createApplication(
            @Valid @RequestBody CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(request, 1L));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit an application for review")
    public ResponseEntity<ApplicationDto> submitApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get applications by customer ID")
    public ResponseEntity<PageResponse<ApplicationDto>> getApplicationsByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(applicationService.getApplicationsByCustomerId(customerId, page, size));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(applicationService.getDashboardStats());
    }
}
