package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.entity.Event;

@Mapper(componentModel = "spring")
public interface EventMapper {
    EventResponse toEventResponse(Event event);

    List<EventResponse> toEventResponse(List<Event> event);
}
