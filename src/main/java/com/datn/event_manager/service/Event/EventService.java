package com.datn.event_manager.service.Event;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventResponse;


public interface EventService {
    String createEvent(EventRequest eventRequest, MultipartFile file);

    List<EventResponse> getAllEvents();

    EventResponse getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest, MultipartFile file);
    
    List<EventByUserResponse> getEventsByUser();
    EventByUserResponse getEventByUser();
}
