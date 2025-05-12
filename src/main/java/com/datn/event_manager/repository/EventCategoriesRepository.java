package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.EventCategories;

public interface EventCategoriesRepository extends JpaRepository<EventCategories, Long> {
    
}
