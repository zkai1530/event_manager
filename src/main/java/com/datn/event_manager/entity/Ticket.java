package com.datn.event_manager.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
@Table(name = "ticket") 
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long ticketId;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    BigDecimal price;

    String description;

    @Column(nullable = false)
    String availableQuantity; // the maximum quantity of tickets available for sale for this event

    String sold; // the number of tickets sold for this event

    @Column
    LocalDateTime saleStart; // null means the ticket is available until the event starts
    @Column
    LocalDateTime saleEnd; // null means the ticket is available until the event end

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    Event event;

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<OrderTicket> orderTickets;

    @ManyToMany
    @JoinTable(
        name = "ticket_discount",
        joinColumns = @JoinColumn(name = "ticket_id"),
        inverseJoinColumns = @JoinColumn(name = "discount_id")
    )
    List<Discount> discounts;
}

