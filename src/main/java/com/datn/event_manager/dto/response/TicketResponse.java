package com.datn.event_manager.dto.response;

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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {
    Long id;
    String name;
    String description;
    Integer sold;
    BigDecimal price;
    Integer availableQuantity;
    Integer reservedQuantity;
    LocalDateTime saleStart;
    LocalDateTime saleEnd;
    List<DiscountResponse> discounts;
}
