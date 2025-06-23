package com.datn.event_manager.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.datn.event_manager.enums.EventType;
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
public class EventRequest {
    String name;
    String summary;
    String description;
    int capacity;
    EventType eventType; // Single, recurring
    EventLocationRequest eventLocationRequest;

    List<FAQRequest> faqs;

    // if eventType is SINGLE
    LocalDate eventDate; // day
    LocalTime startTime;
    LocalTime endTime;

    Boolean hasSeatMap;
}
