package com.datn.event_manager.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventInAdminResponse {
    Long eventId;
    String name;
    String imageUrl;
    String categoryName;
    String city;
    String address;
    String country;
    int ticketSold;
    int ticketTotal;
    String status;

    public EventInAdminResponse(Object eventId, Object name, Object imageUrl, Object categoryName, Object city, Object address,
            Object country, Object ticketSold, Object ticketTotal, Object status) {
        this.eventId = eventId != null ? Long.valueOf(eventId.toString()) : null;
        this.name = name != null ? name.toString() : null;
        this.imageUrl = imageUrl != null ? imageUrl.toString() : null;
        this.categoryName = categoryName != null ? categoryName.toString() : "Không xác định";
        this.city = city != null ? city.toString() : null;
        this.address = address != null ? address.toString() : null;
        this.country = country != null ? country.toString() : null;
        this.ticketSold = ticketSold != null ? Integer.parseInt(ticketSold.toString()) : 0;
        this.ticketTotal = ticketTotal != null ? Integer.parseInt(ticketTotal.toString()) : 0;
        this.status = status != null ? status.toString() : null;
    }
}