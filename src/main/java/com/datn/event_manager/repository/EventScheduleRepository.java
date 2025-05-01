package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;

public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {
    void deleteByEvent(Event event);

    List<EventSchedule> findAllByEvent(Event event);

    @Query("SELECT EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event.id = :eventId)")
    boolean existsByEventId(Long eventId);
}
