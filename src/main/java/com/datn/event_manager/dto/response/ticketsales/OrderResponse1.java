package com.datn.event_manager.dto.response.ticketsales;

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
public class OrderResponse1 {
    List<TicketScheduleResponse> ticketSchedules;
    List<OrderDetailResponse> orders;
}
