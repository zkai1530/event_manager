package com.datn.event_manager.dto.response;
import com.datn.event_manager.dto.request.ScheduleItem;
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
public class EventByUserResponse {
    Long eventId;
    String name;
    String imageUrl;
    String slug;
    EventType eventType; // Single, recurring
    ScheduleItem scheduleItem;
    Boolean isPublished;
    Integer totalTicketsSold;
}
