package com.datn.event_manager.service.Event;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.dto.response.EventStatusResponse;


public interface EventService {
    String createEvent(EventRequest eventRequest, MultipartFile file);

    List<EventResponse> getAllEvents();

    EventResponse getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest, MultipartFile file);
    
    List<EventByUserResponse> getEventsByUser();
    EventByUserResponse getEventByUser();

    EventStatusResponse getEventStatus(Long eventId);

    void publishEvent(Long eventId);

    void unpublishEvent(Long eventId);
}
