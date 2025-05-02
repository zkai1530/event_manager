package com.datn.event_manager.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ticket_schedule")
public class TicketSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    EventSchedule schedule;

    @Column(name = "available_quantity", nullable = false)
    Integer availableQuantity;

    @Column(name = "sold", nullable = false)
    Integer sold = 0;

    @Column(name = "checked_in_count")
    Integer checkedInCount = 0;
}
