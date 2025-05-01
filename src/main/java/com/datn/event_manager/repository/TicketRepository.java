package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT DISTINCT t FROM Ticket t " +
            "JOIN TicketSchedule ts ON ts.ticket = t " +
            "JOIN ts.schedule s " +
            "JOIN s.event e " +
            "WHERE e.eventId = :eventId")
    List<Ticket> findTicketsByEventId(@Param("eventId") Long eventId);

    @Query("SELECT EXISTS (" +
            "SELECT 1 FROM Ticket t " +
            "JOIN TicketSchedule ts ON ts.ticket = t " +
            "JOIN ts.schedule s " +
            "JOIN s.event e " +
            "WHERE e.eventId = :eventId" +
            ")")
    boolean existsByEventId(@Param("eventId") Long eventId);
}
