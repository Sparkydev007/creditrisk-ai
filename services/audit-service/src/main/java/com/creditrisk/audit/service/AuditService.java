package com.creditrisk.audit.service;

import com.creditrisk.audit.entity.AuditLog;
import com.creditrisk.audit.repository.AuditLogRepository;
import com.creditrisk.common.dto.PageResponse;
import com.creditrisk.common.messaging.DomainEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = {"application-events", "risk-events", "decision-events", "audit-events"},
                   groupId = "audit-service")
    public void handleEvent(String message) {
        try {
            DomainEvent event = objectMapper.readValue(message, DomainEvent.class);

            AuditLog auditLog = AuditLog.builder()
                    .entityId(Long.parseLong(event.getAggregateId()))
                    .entityType(event.getAggregateType())
                    .action(event.getEventType())
                    .service("event-consumer")
                    .details(event.getPayload())
                    .correlationId(event.getCorrelationId())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log recorded: {} for {} #{}",
                    event.getEventType(), event.getAggregateType(), event.getAggregateId());

        } catch (Exception e) {
            log.error("Failed to process audit event: {}", e.getMessage());
        }
    }

    @Transactional
    public AuditLog recordAudit(String entityType, Long entityId, String action,
                                 String userId, String service, String details,
                                 String previousState, String newState, String correlationId) {
        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .userId(userId)
                .service(service)
                .details(details)
                .previousState(previousState)
                .newState(newState)
                .correlationId(correlationId)
                .build();

        auditLog = auditLogRepository.save(auditLog);
        log.info("Audit recorded: {} {} #{}", entityType, action, entityId);
        return auditLog;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLog> getAuditLogs(String entityType, Long entityId, int page, int size) {
        Page<AuditLog> auditPage = auditLogRepository.search(entityType, entityId,
                PageRequest.of(page, size));

        return PageResponse.<AuditLog>builder()
                .content(auditPage.getContent())
                .page(auditPage.getNumber())
                .size(auditPage.getSize())
                .totalElements(auditPage.getTotalElements())
                .totalPages(auditPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLog> getAuditLogsByEntity(Long entityId, String entityType, int page, int size) {
        Page<AuditLog> auditPage = auditLogRepository.findByEntityIdAndEntityTypeOrderByCreatedAtDesc(
                entityId, entityType, PageRequest.of(page, size));

        return PageResponse.<AuditLog>builder()
                .content(auditPage.getContent())
                .page(auditPage.getNumber())
                .size(auditPage.getSize())
                .totalElements(auditPage.getTotalElements())
                .totalPages(auditPage.getTotalPages())
                .build();
    }
}
