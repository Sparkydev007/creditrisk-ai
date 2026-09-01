package com.creditrisk.risk.service;

import com.creditrisk.common.messaging.DomainEvent;
import com.creditrisk.common.messaging.EventPublisher;
import com.creditrisk.risk.dto.RiskAssessmentResult;
import com.creditrisk.risk.entity.ApplicationData;
import com.creditrisk.risk.entity.RiskAssessmentRecord;
import com.creditrisk.risk.repository.ApplicationDataRepository;
import com.creditrisk.risk.repository.RiskAssessmentRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskAssessmentService {

    private final RiskCalculationService riskCalculationService;
    private final ApplicationDataRepository applicationDataRepository;
    private final RiskAssessmentRecordRepository recordRepository;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${spring.kafka.topics.application-events:application-events}")
    private String applicationEventsTopic;

    @Value("${spring.kafka.topics.risk-events:risk-events}")
    private String riskEventsTopic;

    @KafkaListener(topics = "${spring.kafka.topics.application-events:application-events}",
                   groupId = "risk-service")
    public void handleApplicationEvent(String message) {
        try {
            DomainEvent event = objectMapper.readValue(message, DomainEvent.class);
            log.info("Received event: {} for aggregate: {}", event.getEventType(), event.getAggregateId());

            if ("ApplicationSubmitted".equals(event.getEventType())) {
                Map<String, Object> payload = objectMapper.readValue(event.getPayload(), Map.class);
                Long applicationId = ((Number) payload.get("applicationId")).longValue();

                // Check if already assessed
                Optional<RiskAssessmentRecord> existing = recordRepository.findByApplicationId(applicationId);
                if (existing.isPresent()) {
                    log.info("Risk assessment already exists for application: {}", applicationId);
                    return;
                }

                processRiskAssessment(applicationId);
            }
        } catch (Exception e) {
            log.error("Error processing event: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public RiskAssessmentRecord processRiskAssessment(Long applicationId) {
        log.info("Processing risk assessment for application: {}", applicationId);

        ApplicationData appData = applicationDataRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application data not found: " + applicationId));

        try {
            RiskAssessmentResult result = riskCalculationService.assessRisk(appData);

            RiskAssessmentRecord record = RiskAssessmentRecord.builder()
                    .applicationId(applicationId)
                    .probabilityOfDefault(result.getProbabilityOfDefault())
                    .riskScore(result.getRiskScore())
                    .riskCategory(result.getRiskCategory())
                    .riskFactorsJson(objectMapper.writeValueAsString(result.getRiskFactors()))
                    .explanationJson(result.getExplanation())
                    .modelVersion(result.getModelVersion())
                    .build();

            record = recordRepository.save(record);
            appData.setStatus("COMPLETED");
            applicationDataRepository.save(appData);

            // Publish completion event
            DomainEvent event = DomainEvent.create(
                    "RiskAssessmentCompleted",
                    String.valueOf(applicationId),
                    "RiskAssessment",
                    objectMapper.writeValueAsString(Map.of(
                            "applicationId", applicationId,
                            "riskScore", record.getRiskScore(),
                            "riskCategory", record.getRiskCategory(),
                            "probabilityOfDefault", record.getProbabilityOfDefault()
                    )),
                    null
            );
            eventPublisher.publish(riskEventsTopic, event);

            log.info("Risk assessment completed for application {}: score={}, category={}",
                    applicationId, record.getRiskScore(), record.getRiskCategory());

            return record;

        } catch (Exception e) {
            log.error("Risk assessment failed for application {}: {}", applicationId, e.getMessage());
            appData.setStatus("FAILED");
            applicationDataRepository.save(appData);

            // Publish failure event
            DomainEvent event = DomainEvent.create(
                    "RiskAssessmentFailed",
                    String.valueOf(applicationId),
                    "RiskAssessment",
                    objectMapper.writeValueAsString(Map.of(
                            "applicationId", applicationId,
                            "error", e.getMessage()
                    )),
                    null
            );
            eventPublisher.publish(riskEventsTopic, event);

            throw new RuntimeException("Risk assessment failed", e);
        }
    }
}
