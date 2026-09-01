package com.creditrisk.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private String action;

    private String userId;

    private String service;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String previousState;

    private String newState;

    private String correlationId;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
