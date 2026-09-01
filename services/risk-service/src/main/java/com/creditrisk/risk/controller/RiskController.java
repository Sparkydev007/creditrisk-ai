package com.creditrisk.risk.controller;

import com.creditrisk.common.exception.ResourceNotFoundException;
import com.creditrisk.risk.entity.RiskAssessmentRecord;
import com.creditrisk.risk.repository.RiskAssessmentRecordRepository;
import com.creditrisk.risk.service.RiskAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
@Tag(name = "Risk Assessment", description = "Risk assessment management")
public class RiskController {

    private final RiskAssessmentService riskAssessmentService;
    private final RiskAssessmentRecordRepository recordRepository;

    @PostMapping("/assess/{applicationId}")
    @Operation(summary = "Trigger risk assessment for an application")
    public ResponseEntity<RiskAssessmentRecord> assessRisk(@PathVariable Long applicationId) {
        RiskAssessmentRecord record = riskAssessmentService.processRiskAssessment(applicationId);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/assessment/{applicationId}")
    @Operation(summary = "Get risk assessment for an application")
    public ResponseEntity<RiskAssessmentRecord> getRiskAssessment(@PathVariable Long applicationId) {
        RiskAssessmentRecord record = recordRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Risk assessment for application", applicationId));
        return ResponseEntity.ok(record);
    }
}
