package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    
}
