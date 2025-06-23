package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.VenueMap;

public interface VenueMapRepository extends JpaRepository<VenueMap, Long> {
    boolean existsByEventEventId(Long eventId);
}
