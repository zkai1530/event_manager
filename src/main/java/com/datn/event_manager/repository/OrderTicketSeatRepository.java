package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.OrderTicketSeat;

public interface OrderTicketSeatRepository extends JpaRepository<OrderTicketSeat, Long> {
    @Query("SELECT ots FROM OrderTicketSeat ots WHERE ots.orderTicket IN :orderTickets")
    List<OrderTicketSeat> findByOrderTicketIn(@Param("orderTickets") List<OrderTicket> orderTickets);
}
