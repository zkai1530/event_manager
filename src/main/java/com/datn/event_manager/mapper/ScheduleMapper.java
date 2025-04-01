package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.datn.event_manager.dto.response.EventScheduleResponse;
import com.datn.event_manager.entity.EventSchedule;

@Mapper(componentModel = "spring", uses = TicketMapper.class)
public interface ScheduleMapper {
    
    List<EventScheduleResponse> toEventScheduleResponse(List<EventSchedule> eventSchedules);
    EventScheduleResponse toEventScheduleResponse(EventSchedule eventSchedules);
}
