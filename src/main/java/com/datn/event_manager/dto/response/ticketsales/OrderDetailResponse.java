package com.datn.event_manager.dto.response.ticketsales;

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
public class OrderDetailResponse {
    Long orderId;
    String userName;
    String email;
    String avatarUrl;
    LocalDateTime createdAt;
    Boolean isCheckedIn;
    List<OrderTicketResponse1> orderTickets;
}
