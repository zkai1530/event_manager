package com.datn.event_manager.dto.response;

import java.time.LocalDate;
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
public class EventSearchResponse {
    Long eventId;
    String name;
    String imageUrl;
    String summary;
    EventType eventType;
    EventLocationResponse eventLocation;
    List<EventScheduleSearchResponse> schedules;
}
