package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.FAQ;

public interface FAQRepository extends JpaRepository<FAQ, Long> {
    
}
