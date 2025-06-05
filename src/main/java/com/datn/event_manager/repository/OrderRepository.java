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

import com.datn.event_manager.dto.response.SuccessOrderResponse;
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

        // List<Order> findAllByUser(User user);

        // List<Order> findAllByUserAndStatus(User user, OrderStatus status);

        @Query(value = """
                            SELECT o.* FROM `order` o
                            JOIN event_schedule es ON o.schedule_id = es.schedule_id
                            WHERE o.user_id = :user
                            AND (:status IS NULL OR o.status = :status)
                            AND ((:isUpcoming = TRUE AND TIMESTAMP(es.schedule_date, es.start_time) > :now)
                                 OR (:isUpcoming = FALSE AND TIMESTAMP(es.schedule_date, es.start_time) < :now))
                            ORDER BY es.schedule_date DESC, es.start_time DESC
                        """, nativeQuery = true)
        Page<Order> findOrdersByUserStatusAndTimeFilter(
                        @Param("user") String user,
                        @Param("status") String status,
                        @Param("isUpcoming") boolean isUpcoming,
                        @Param("now") LocalDateTime now,
                        Pageable pageable);

        @Query("SELECT DISTINCT o FROM Order o " +
                  "JOIN o.user u " +
                  "LEFT JOIN o.orderTickets ot " +
                  "LEFT JOIN ot.ticket t " +
                  "WHERE o.schedule.scheduleId = :scheduleId AND o.status = 'PAID'")
        Page<Order> findOrdersByScheduleId(@Param("scheduleId") Long scheduleId, Pageable pageable);

        @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.schedule = :schedule AND o.status = 'PAID'")
        BigDecimal getTotalPaidAmountBySchedule(EventSchedule schedule);

        @Query("SELECT COUNT(o) " +
                  "FROM Order o " +
                  "WHERE o.schedule.scheduleId = :scheduleId AND o.status = 'PAID' AND o.isCheckedIn = true")
        Long countCheckedInByScheduleId(@Param("scheduleId") Long scheduleId);

        @Query("SELECT COUNT(o) " +
                  "FROM Order o " +
                  "WHERE o.schedule.scheduleId = :scheduleId AND o.status = 'PAID' AND o.isCheckedIn = false")
        Long countNotCheckedInByScheduleId(@Param("scheduleId") Long scheduleId);

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

        // tổng vé đã mua
        @Query("SELECT COALESCE(SUM(ot.quantity), 0) " +
                        "FROM Order o JOIN o.orderTickets ot " +
                        "WHERE o.user = :user AND o.status = com.datn.event_manager.entity.Order.OrderStatus.PAID")
        Long sumTotalPurchasedTicketsByUser(@Param("user") User user);

        // success order
        @Query("SELECT o " +
                  "FROM Order o " +
                  "LEFT JOIN FETCH o.user " +
                  "LEFT JOIN FETCH o.schedule es " +
                  "LEFT JOIN FETCH es.event e " +
                  "LEFT JOIN FETCH e.eventLocation " +
                  "LEFT JOIN FETCH o.orderTickets ot " +
                  "LEFT JOIN FETCH ot.ticket " +
                  "WHERE o.orderId = :orderId AND o.status = 'PAID'")
        Optional<Order> findSuccessOrderDetails(@Param("orderId") Long orderId);

        // admin dashboard
        @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'PAID'")
        BigDecimal getTotalRevenue();

        // * doanh thu theo tháng
        @Query("SELECT FUNCTION('MONTH', o.createdAt) AS month, SUM(o.totalPrice) AS revenue " +
                        "FROM Order o " +
                        "WHERE o.status = 'PAID' AND FUNCTION('YEAR', o.createdAt) = :year " +
                        "GROUP BY FUNCTION('MONTH', o.createdAt)")
        List<Object[]> getRevenueByYear(@Param("year") int year);

        // * top 5 sự kiện nhiều doanh thu theo khoảng ngày
        @Query("SELECT e.name, e.imageUrl, SUM(o.totalPrice) " +
                        "FROM Order o " +
                        "JOIN o.schedule es " +
                        "JOIN es.event e " +
                        "WHERE o.status = 'PAID' AND FUNCTION('DATE', o.createdAt) BETWEEN :startDate AND :endDate " +
                        "GROUP BY e.eventId, e.name, e.imageUrl " +
                        "ORDER BY SUM(o.totalPrice) DESC")
        Page<Object[]> getTop5EventsByRevenue(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate, Pageable pageable);

          // admin dashboard
          @Query(value = "SELECT " +
                    "    u.avatar_url AS avatar_url, " +
                    "    u.name AS user_name, " +
                    "    u.email AS email, " +
                    "    o.total_price AS total_price, " +
                    "    o.status AS status, " +
                    "    e.name AS event_name, " +
                    "    es.schedule_date AS schedule_date, " +
                    "    es.start_time AS start_time, " +
                    "    es.end_time AS end_time, " +
                    "    e.image_url AS event_image_url, " +
                    "    o.created_at AS created_at " +
                    "FROM `order` o " +
                    "JOIN user u ON o.user_id = u.user_id " +
                    "JOIN event_schedule es ON o.schedule_id = es.schedule_id " +
                    "JOIN event e ON es.event_id = e.event_id " +
                    "ORDER BY o.created_at DESC " +
                    "LIMIT 5", nativeQuery = true)
          List<Object[]> findRecentOrders();

          // admin statistic
          @Query("SELECT o.status, COUNT(o) FROM Order o WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month GROUP BY o.status")
          List<Object[]> countOrdersByStatus(@Param("year") int year, @Param("month") int month);

          @Query("SELECT MONTH(o.createdAt), COUNT(o), SUM(CASE WHEN o.status = 'CANCELED' THEN 1 ELSE 0 END) " +
                    "FROM Order o WHERE YEAR(o.createdAt) = :year GROUP BY MONTH(o.createdAt)")
          List<Object[]> countOrdersAndCanceledByMonth(@Param("year") int year);
     }
