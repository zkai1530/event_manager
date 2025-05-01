package com.datn.event_manager.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.User;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByUser(User user);

    Event findByUser(User user);

    @Query("SELECT COALESCE(SUM(DISTINCT t.sold), 0) " +
            "FROM Ticket t " +
            "JOIN t.ticketSchedules ts " +
            "JOIN ts.schedule es " +
            "WHERE es.event.eventId = :eventId")
    Integer getTotalTicketsSold(@Param("eventId") Long eventId);

    @Query("SELECT e.eventId, es.scheduleId, e.name " +
            "FROM Event e JOIN EventSchedule es ON e.eventId = es.event.eventId " +
            "WHERE es.scheduleDate = :tomorrow")
    List<Object[]> findSchedulesForTomorrow(LocalDate tomorrow);
}
