package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Complaint;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Order;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    boolean existsByOrder(Order order);

    // đếm số phàn nàn bằng cách đếm tất cả số lượng vé mua trong đơn hàng
    @Query("SELECT SUM(ot.quantity) FROM Complaint c JOIN c.order o JOIN o.orderTickets ot WHERE o.schedule = :schedule")
    Long countComplaintTicketsBySchedule(EventSchedule schedule);

    @Query("SELECT c FROM Complaint c JOIN c.order o WHERE o.schedule = :schedule")
    List<Complaint> findByOrderSchedule(EventSchedule schedule);
}
