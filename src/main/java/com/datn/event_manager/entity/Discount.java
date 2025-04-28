package com.datn.event_manager.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.datn.event_manager.enums.DiscountType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
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
@Table(name = "discount")
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    Long discountId;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "promo_code")
    String promoCode; // code or no code(discount)

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    DiscountType discountType; // percent or fixed

    @Column(name = "discount_value", nullable = false)
    BigDecimal discountValue; // percent or fixed value

    @Column(name = "max_uses")
    Integer maxUses; // max discount can be used (unlimited if null or limited)

    @Column(name = "times_used")
    private Integer timesUsed = 0; // number of times the discount has been used

    @Column(name = "discount_start")
    LocalDateTime discountStart; // null means the discount is available until the event starts

    @Column(name = "discount_end")
    LocalDateTime discountEnd; // null means the discount is available until the event end

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "discount", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<TicketDiscount> ticketDiscounts;
}
