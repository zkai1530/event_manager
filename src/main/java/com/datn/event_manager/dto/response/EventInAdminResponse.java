package com.datn.event_manager.dto.response;

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
public class EventInAdminResponse {
    Long eventId;
    String name;
    String categoryName;
    String city;
    String address;
    String country;
    int ticketSold;
    int ticketTotal;
    String status;

    public EventInAdminResponse(Long eventId, String name, String categoryName, String city, String address,
            String country, Long ticketSold, Long ticketTotal, String status) {
        this.eventId = eventId;
        this.name = name;
        this.categoryName = categoryName;
        this.city = city;
        this.address = address;
        this.country = country;
        this.ticketSold = ticketSold != null ? ticketSold.intValue() : 0;
        this.ticketTotal = ticketTotal != null ? ticketTotal.intValue() : 0;
        this.status = status;
    }
}
