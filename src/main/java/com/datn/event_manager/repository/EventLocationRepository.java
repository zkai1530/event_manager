package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.EventLocation;

public interface EventLocationRepository extends JpaRepository<EventLocation, Long> {
    
}
