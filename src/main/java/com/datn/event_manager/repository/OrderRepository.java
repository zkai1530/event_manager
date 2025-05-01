package com.datn.event_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPaymentLinkId(String paymentLinkId);

    @Query("SELECT DISTINCT o.user.userId " +
            "FROM Order o JOIN o.orderTickets ot " +
            "JOIN TicketSchedule ts ON ot.ticket.ticketId = ts.ticket.ticketId " +
            "WHERE ts.schedule.scheduleId = :scheduleId")
    List<String> findUsersByScheduleId(Long scheduleId);
}
