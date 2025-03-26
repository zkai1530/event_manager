package com.datn.event_manager.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketRequest {
    String name;
    String description;
    BigDecimal price;
    Integer availableQuantity;
    LocalDateTime saleStart;
    LocalDateTime saleEnd;
    List<Long> scheduleIds;
}
