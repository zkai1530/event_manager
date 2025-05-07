package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.CancelReason;

public interface CancelReasonRepository extends JpaRepository<CancelReason, Long> {
    
}
