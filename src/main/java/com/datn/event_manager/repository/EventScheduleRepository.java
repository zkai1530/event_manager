package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;

public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {
    void deleteByEvent(Event event);
    List<EventSchedule> findAllByEvent(Event event);
}
