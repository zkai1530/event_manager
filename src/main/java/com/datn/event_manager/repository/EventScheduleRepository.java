package com.datn.event_manager.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.User;

public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {
    void deleteByEvent(Event event);

    List<EventSchedule> findAllByEvent(Event event);

    @Query("SELECT EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event.id = :eventId)")
    boolean existsByEventId(Long eventId);

    @Query("SELECT es FROM EventSchedule es " +
                    "LEFT JOIN FETCH es.event e " +
                    "LEFT JOIN FETCH es.ticketSchedules ts " +
                    "LEFT JOIN FETCH ts.ticket t " +
                    "WHERE e.isPublished = true AND es.scheduleDate < :currentDate AND es.isDisbursed = false AND es.event IS NOT NULL AND e.eventId = :eventId")
    List<EventSchedule> findUndisbursedSchedulesByEventId(@Param("currentDate") LocalDate currentDate,
                    @Param("eventId") Long eventId);
}
