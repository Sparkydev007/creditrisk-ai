package com.creditrisk.audit.repository;

import com.creditrisk.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityIdAndEntityTypeOrderByCreatedAtDesc(
            Long entityId, String entityType, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:entityId IS NULL OR a.entityId = :entityId) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> search(@Param("entityType") String entityType,
                          @Param("entityId") Long entityId,
                          Pageable pageable);
}
