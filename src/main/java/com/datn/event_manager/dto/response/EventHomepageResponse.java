package com.datn.event_manager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

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
public class EventHomepageResponse {
    Long eventId;
    String name;
    String imageUrl;
    String slug;
    LocalDate scheduleDate; // ngày gần nhất chưa diễn ra
    Long soldTickets;
    BigDecimal minPrice;
}
