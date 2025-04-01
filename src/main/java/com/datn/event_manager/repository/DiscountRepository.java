package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Discount;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    @Query("SELECT DISTINCT d FROM Discount d " +
            "JOIN TicketDiscount td ON td.discount = d " +
            "JOIN td.ticket t " + 
            "JOIN TicketSchedule ts ON ts.ticket = t " + 
            "JOIN ts.schedule s " + 
            "JOIN s.event e " + 
            "WHERE e.eventId = :eventId")
    List<Discount> findDiscountsByEventId(@Param("eventId") Long eventId);
}
