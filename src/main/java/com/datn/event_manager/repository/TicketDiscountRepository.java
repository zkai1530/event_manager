package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketDiscount;

public interface TicketDiscountRepository extends JpaRepository<TicketDiscount, Long> {
    boolean existsByTicketAndDiscount(Ticket ticket, Discount discount);

}
