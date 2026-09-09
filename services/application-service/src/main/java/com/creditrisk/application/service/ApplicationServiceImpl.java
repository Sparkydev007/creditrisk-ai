package com.creditrisk.application.service;

import com.creditrisk.common.dto.PageResponse;
import com.creditrisk.common.exception.InvalidOperationException;
import com.creditrisk.common.exception.ResourceNotFoundException;
import com.creditrisk.common.messaging.DomainEvent;
import com.creditrisk.common.messaging.EventPublisher;
import com.creditrisk.application.dto.*;
import com.creditrisk.application.entity.CreditApplication;
import com.creditrisk.application.entity.Decision;
import com.creditrisk.application.entity.RiskAssessment;
import com.creditrisk.application.repository.CreditApplicationRepository;
import com.creditrisk.application.repository.DecisionRepository;
import com.creditrisk.application.repository.RiskAssessmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.creditrisk.constants.ApplicationStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl {

    private final CreditApplicationRepository applicationRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final DecisionRepository decisionRepository;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${spring.kafka.topics.application-events:application-events}")
    private String applicationEventsTopic;

    @Value("${spring.kafka.topics.risk-events:risk-events}")
    private String riskEventsTopic;

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto> getApplications(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<CreditApplication> appPage = applicationRepository.search(search, PageRequest.of(page, size, sort));

        return PageResponse.<ApplicationDto>builder()
                .content(appPage.getContent().stream().map(this::toDto).toList())
                .page(appPage.getNumber())
                .size(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public ApplicationDto getApplicationById(Long id) {
        CreditApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
        return toDto(app);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto> getApplicationsByCustomerId(Long customerId, int page, int size) {
        Page<CreditApplication> appPage = applicationRepository.findByCustomerId(
                customerId, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return PageResponse.<ApplicationDto>builder()
                .content(appPage.getContent().stream().map(this::toDto).toList())
                .page(appPage.getNumber())
                .size(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .build();
    }

    @Transactional
    public ApplicationDto createApplication(CreateApplicationRequest request, Long userId) {
        CreditApplication app = CreditApplication.builder()
                .customerId(request.getCustomerId())
                .status(ApplicationStatus.DRAFT)
                .loanAmount(request.getLoanAmount())
                .loanType(request.getLoanType())
                .loanTermMonths(request.getLoanTermMonths())
                .purpose(request.getPurpose())
                .monthlyIncome(request.getMonthlyIncome())
                .existingDebt(request.getExistingDebt())
                .creditScore(request.getCreditScore())
                .notes(request.getNotes())
                .submittedByUserId(userId)
                .build();

        app = applicationRepository.save(app);
        log.info("Application created: {} for customer: {}", app.getId(), app.getCustomerId());
        return toDto(app);
    }

    @Transactional
    public ApplicationDto submitApplication(Long id) {
        CreditApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));

        if (app.getStatus() != ApplicationStatus.DRAFT) {
            throw new InvalidOperationException("Only DRAFT applications can be submitted");
        }

        app.setStatus(ApplicationStatus.SUBMITTED);
        app = applicationRepository.save(app);

        // Publish event
        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                    "applicationId", app.getId(),
                    "customerId", app.getCustomerId(),
                    "loanAmount", app.getLoanAmount()
            ));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize application event payload", e);
        }

        DomainEvent event = DomainEvent.create(
                "ApplicationSubmitted",
                String.valueOf(app.getId()),
                "CreditApplication",
                payload,
                null
        );
        eventPublisher.publish(applicationEventsTopic, event);

        log.info("Application submitted: {}", id);
        return toDto(app);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        var statusCounts = applicationRepository.getStatusCounts();
        Map<String, Long> counts = new HashMap<>();
        long total = 0;
        long approved = 0, rejected = 0, review = 0, pending = 0;

        for (Object[] row : statusCounts) {
            String status = (String) row[0];
            Long count = (Long) row[1];
            counts.put(status, count);
            total += count;
            switch (status) {
                case "APPROVED" -> approved = count;
                case "REJECTED" -> rejected = count;
                case "MANUAL_REVIEW" -> review = count;
                case "DRAFT", "SUBMITTED", "UNDER_REVIEW" -> pending += count;
            }
        }

        return DashboardStatsDto.builder()
                .totalApplications(total)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .manualReviewCount(review)
                .pendingCount(pending)
                .approvalRate(total > 0 ? (double) approved / total * 100 : 0)
                .rejectionRate(total > 0 ? (double) rejected / total * 100 : 0)
                .manualReviewRate(total > 0 ? (double) review / total * 100 : 0)
                .statusCounts(counts)
                .build();
    }

    private ApplicationDto toDto(CreditApplication app) {
        ApplicationDto.ApplicationDtoBuilder builder = ApplicationDto.builder()
                .id(app.getId())
                .customerId(app.getCustomerId())
                .status(app.getStatus().name())
                .loanAmount(app.getLoanAmount())
                .loanType(app.getLoanType())
                .loanTermMonths(app.getLoanTermMonths())
                .interestRate(app.getInterestRate())
                .purpose(app.getPurpose())
                .monthlyIncome(app.getMonthlyIncome())
                .existingDebt(app.getExistingDebt())
                .creditScore(app.getCreditScore())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt());

        // Attach risk assessment if exists
        riskAssessmentRepository.findByApplicationId(app.getId()).ifPresent(ra -> {
            builder.riskAssessment(RiskAssessmentDto.builder()
                    .id(ra.getId())
                    .applicationId(ra.getApplicationId())
                    .probabilityOfDefault(ra.getProbabilityOfDefault())
                    .riskScore(ra.getRiskScore())
                    .riskCategory(ra.getRiskCategory() != null ? ra.getRiskCategory().name() : null)
                    .riskFactorsJson(ra.getRiskFactorsJson())
                    .explanationJson(ra.getExplanationJson())
                    .modelVersion(ra.getModelVersion())
                    .createdAt(ra.getCreatedAt())
                    .build());
        });

        // Attach decision if exists
        decisionRepository.findByApplicationId(app.getId()).ifPresent(d -> {
            builder.decision(DecisionDto.builder()
                    .id(d.getId())
                    .applicationId(d.getApplicationId())
                    .riskAssessmentId(d.getRiskAssessmentId())
                    .outcome(d.getOutcome().name())
                    .probabilityOfDefault(d.getProbabilityOfDefault())
                    .debtToIncomeRatio(d.getDebtToIncomeRatio())
                    .loanToIncomeRatio(d.getLoanToIncomeRatio())
                    .explanationJson(d.getExplanationJson())
                    .riskFactorsJson(d.getRiskFactorsJson())
                    .createdAt(d.getCreatedAt())
                    .build());
        });

        return builder.build();
    }
}
