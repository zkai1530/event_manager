package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;

public interface TicketScheduleRepository extends JpaRepository<TicketSchedule, Long> {
    void deleteByTicket(Ticket ticket);
    List<TicketSchedule> findAllByScheduleIn(List<EventSchedule> schedules);
}
