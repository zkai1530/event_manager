package com.datn.event_manager.dto.response;

import java.util.List;

import com.datn.event_manager.entity.FAQ;
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
public class EventResponse {
    Long eventId;
    String name;
    String imageUrl;
    String summary;
    String description;
    int capacity;
    EventType eventType; // Single, recurring
    Boolean isPublished;
    EventLocationResponse eventLocation;
    List<EventScheduleResponse> schedules;
    List<FAQResponse> faqs;
}
