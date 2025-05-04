package com.datn.event_manager.dto.response.ticketsales;

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
public class OrderTicketResponse1 {
    Long ticketId;
    Integer quantity;
    Double priceAtPurchase;
}
