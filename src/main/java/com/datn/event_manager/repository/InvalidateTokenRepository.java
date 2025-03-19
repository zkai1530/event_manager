package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.InvalidateToken;

public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, String> {
    
}
