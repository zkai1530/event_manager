package com.datn.event_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.Order.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPaymentLinkId(String paymentLinkId);

    @Query("SELECT DISTINCT o.user.userId " +
            "FROM Order o JOIN o.orderTickets ot " +
            "JOIN TicketSchedule ts ON ot.ticket.ticketId = ts.ticket.ticketId " +
            "WHERE ts.schedule.scheduleId = :scheduleId")
    List<String> findUsersByScheduleId(Long scheduleId);

    Optional<Order> findByQrCode(String qrCode);

    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);

    @Query("SELECT o, u, ot, t " +
           "FROM Order o " +
           "JOIN o.user u " +
           "LEFT JOIN o.orderTickets ot " +
           "LEFT JOIN ot.ticket t " +
           "WHERE o.schedule.scheduleId = :scheduleId")
    List<Object[]> findOrdersByScheduleId(@Param("scheduleId") Long scheduleId);
}
