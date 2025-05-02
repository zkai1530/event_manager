package com.datn.event_manager.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
public class OrderResponse {
    Long orderId;
    String qrCode;
    Boolean isCheckedIn;
    String eventName;
    LocalDate scheduleDate;
    LocalTime startTime;
LocalTime endTime;
    int totalQuantity;
    List<OrderTicketResponse> orderTickets;
}
