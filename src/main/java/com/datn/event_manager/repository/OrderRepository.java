package com.datn.event_manager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPaymentLinkId(String paymentLinkId);
}
