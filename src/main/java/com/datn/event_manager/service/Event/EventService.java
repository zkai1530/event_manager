package com.datn.event_manager.service.Event;

import java.util.List;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.EventResponse;

public interface EventService {
    String createEvent(EventRequest eventRequest);

    List<EventResponse> getAllEvents();

    EventResponse getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest);
}
