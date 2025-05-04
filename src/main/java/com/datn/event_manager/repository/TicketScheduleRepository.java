package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;

public interface TicketScheduleRepository extends JpaRepository<TicketSchedule, Long> {
    void deleteByTicket(Ticket ticket);
    List<TicketSchedule> findAllByScheduleIn(List<EventSchedule> schedules);

    @Query("SELECT ts, t " +
           "FROM TicketSchedule ts " +
           "JOIN ts.ticket t " +
           "WHERE ts.schedule.scheduleId = :scheduleId")
    List<Object[]> findTicketSchedulesByScheduleId(@Param("scheduleId") Long scheduleId);
}
