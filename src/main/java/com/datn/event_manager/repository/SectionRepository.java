package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Section;

public interface SectionRepository  extends JpaRepository<Section, Long> {
    
}
