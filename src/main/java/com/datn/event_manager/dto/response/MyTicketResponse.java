package com.datn.event_manager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.datn.event_manager.entity.Order.OrderStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MyTicketResponse {
    Long orderId;
    String eventImageUrl;
    String eventName;
    LocalDate scheduleDate;
    LocalTime startTime;
    EventLocationResponse location;
    OrderStatus status;
    String qrCode;
    List<TicketItemDetail> tickets;
    BigDecimal totalPrice;
    String orderCode;
}