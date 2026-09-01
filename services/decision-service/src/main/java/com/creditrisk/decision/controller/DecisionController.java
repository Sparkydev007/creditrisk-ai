package com.creditrisk.decision.controller;

import com.creditrisk.common.exception.ResourceNotFoundException;
import com.creditrisk.decision.entity.DecisionPolicy;
import com.creditrisk.decision.entity.DecisionRecord;
import com.creditrisk.decision.repository.DecisionPolicyRepository;
import com.creditrisk.decision.repository.DecisionRecordRepository;
import com.creditrisk.decision.service.DecisionEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
@Tag(name = "Decisions", description = "Decision engine and policy management")
public class DecisionController {

    private final DecisionEngineService decisionEngineService;
    private final DecisionRecordRepository decisionRepository;
    private final DecisionPolicyRepository policyRepository;

    @GetMapping("/{applicationId}")
    @Operation(summary = "Get decision for an application")
    public ResponseEntity<DecisionRecord> getDecision(@PathVariable Long applicationId) {
        DecisionRecord record = decisionRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Decision for application", applicationId));
        return ResponseEntity.ok(record);
    }

    @PostMapping("/process/{applicationId}")
    @Operation(summary = "Manually trigger decision processing")
    public ResponseEntity<DecisionRecord> processDecision(
            @PathVariable Long applicationId,
            @RequestParam int riskScore,
            @RequestParam String riskCategory,
            @RequestParam BigDecimal probabilityOfDefault,
            @RequestParam(required = false) BigDecimal debtToIncomeRatio,
            @RequestParam(required = false) BigDecimal loanToIncomeRatio) {
        return ResponseEntity.ok(decisionEngineService.processDecision(
                applicationId, riskScore, riskCategory, probabilityOfDefault,
                debtToIncomeRatio, loanToIncomeRatio));
    }

    @GetMapping("/policies")
    @Operation(summary = "Get all decision policies")
    public ResponseEntity<List<DecisionPolicy>> getPolicies() {
        return ResponseEntity.ok(policyRepository.findAll());
    }

    @PutMapping("/policies/{id}")
    @Operation(summary = "Update a decision policy")
    public ResponseEntity<DecisionPolicy> updatePolicy(
            @PathVariable Long id,
            @RequestBody DecisionPolicy policy) {
        DecisionPolicy existing = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", id));
        existing.setPolicyConfig(policy.getPolicyConfig());
        existing.setEnabled(policy.isEnabled());
        return ResponseEntity.ok(policyRepository.save(existing));
    }
}
