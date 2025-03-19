package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    
}
