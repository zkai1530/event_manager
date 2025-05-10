package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Complaint;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.User;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    boolean existsByOrder(Order order);

    // đếm số phàn nàn bằng cách đếm tất cả số lượng vé mua trong đơn hàng
    @Query("SELECT SUM(ot.quantity) FROM Complaint c JOIN c.order o JOIN o.orderTickets ot WHERE o.schedule = :schedule")
    Long countComplaintTicketsBySchedule(EventSchedule schedule);

    @Query("SELECT c FROM Complaint c JOIN c.order o WHERE o.schedule = :schedule")
    List<Complaint> findByOrderSchedule(EventSchedule schedule);

    // thống kê cho organizer
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.order.schedule.event.user = :user")
    Long countTotalComplaintsByUser(@Param("user") User user);

    // * đếm số phàn nàn theo lí do
    @Query("SELECT c.reason.reasonName AS reason, COUNT(c) AS count " +
            "FROM Complaint c " +
            "WHERE c.order.schedule.event.user = :user " +
            "GROUP BY c.reason.reasonName")
    List<Object[]> findComplaintsByReason(@Param("user") User user);
}
