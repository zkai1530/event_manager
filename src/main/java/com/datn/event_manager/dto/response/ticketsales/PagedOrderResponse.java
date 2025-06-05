package com.datn.event_manager.dto.response.ticketsales;

import java.math.BigDecimal;

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
public class PagedOrderResponse {
    OrderResponse1 data;
    BigDecimal totalRevenue;
    Long totalCheckedIn;
    int pageNumber;
    int pageSize;
    long totalElements;
    int totalPages;
    boolean last;
    boolean first;
}
