package com.datn.event_manager.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.EventSchedule;
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

        List<Order> findAllByUser(User user);

        List<Order> findAllByUserAndStatus(User user, OrderStatus status);

        @Query("SELECT o FROM Order o " +
                        "WHERE o.user = :user " +
                        "AND (:status IS NULL OR o.status = :status) " +
                        "AND ((:isUpcoming = TRUE AND FUNCTION('TIMESTAMP', o.schedule.scheduleDate, o.schedule.startTime) > :now) "
                        +
                        "   OR (:isUpcoming = FALSE AND FUNCTION('TIMESTAMP', o.schedule.scheduleDate, o.schedule.startTime) < :now)) "
                        +
                        "ORDER BY o.schedule.scheduleDate DESC, o.schedule.startTime DESC")
        Page<Order> findOrdersByUserStatusAndTimeFilter(
                        @Param("user") User user,
                        @Param("status") OrderStatus status,
                        @Param("isUpcoming") boolean isUpcoming,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);

        @Query("SELECT o, u, ot, t " +
                        "FROM Order o " +
                        "JOIN o.user u " +
                        "LEFT JOIN o.orderTickets ot " +
                        "LEFT JOIN ot.ticket t " +
                        "WHERE o.schedule.scheduleId = :scheduleId AND o.status = 'PAID'")
        Page<Object[]> findOrdersByScheduleId(@Param("scheduleId") Long scheduleId, Pageable pageable);

        @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.schedule = :schedule AND o.status = 'paid'")
        BigDecimal getTotalPaidAmountBySchedule(EventSchedule schedule);

        // thống kê cho organizer
        @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.schedule.event.user =:user AND o.status = 'PAID'")
        BigDecimal sumTotalRevenueByUser(@Param("user") User user);

        // * tính tổng tiền theo tuần (truyền vào tháng và năm)
        @Query("SELECT FUNCTION('DATE', o.createdAt) AS orderDate, COALESCE(SUM(o.totalPrice), 0) AS revenue " +
                        "FROM Order o " +
                        "WHERE o.schedule.event.user = :user " +
                        "AND FUNCTION('YEAR', o.createdAt) = :year " +
                        "AND FUNCTION('MONTH', o.createdAt) = :month " +
                        "AND o.status = 'PAID' " +
                        "GROUP BY FUNCTION('DATE', o.createdAt)")
        List<Object[]> findRevenueByWeek(@Param("user") User user, @Param("year") int year,
                        @Param("month") int month);

        // * đếm status của vé của tất cả sự kiện
        @Query("SELECT " +
                        "COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN 1 ELSE 0 END), 0), " +
                        "COALESCE(SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END), 0), " +
                        "COALESCE(SUM(CASE WHEN o.status = 'CANCELED' THEN 1 ELSE 0 END), 0) " +
                        "FROM Order o WHERE o.schedule.event.user = :user")
        Object countTicketPaymentStatusByUser(@Param("user") User user);
}
