package com.datn.event_manager.entity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) 
@Entity
@Table(name = "payment") 
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    Long paymentId;

    @Column(name = "payment_method", nullable = false)
    String paymentMethod; // Paypal, Banking, ...

    @Column(name = "transaction_id", nullable = false)
    String transactionId; // Transaction ID from Payment Gateway

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    PaymentStatus status = PaymentStatus.PENDING; // PENDING, SUCCESS, FAILED

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    Order order;
    
    // Enum for Payment Status
    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}
