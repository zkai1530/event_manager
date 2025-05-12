package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.EventThemes;

public interface EventThemesRepository extends JpaRepository<EventThemes, Long> {
    
}
