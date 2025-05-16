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
}
