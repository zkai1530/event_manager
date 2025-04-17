package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.enums.EventType;

@Mapper(componentModel = "spring", uses = TicketMapper.class)
public interface EventMapper {
    @Named("toEventResponse")
    EventResponse toEventResponse(Event event);

    @IterableMapping(qualifiedByName = "toEventResponse")
    List<EventResponse> toEventResponse(List<Event> event);

    @Mapping(target = "totalTicketsSold", ignore = true) 
    @Mapping(target = "scheduleItem", source = ".", qualifiedByName = "mapScheduleItem")
    EventByUserResponse toEventByUserResponse(Event event);

    List<EventByUserResponse> toEventByUserResponseList(List<Event> events);
    @Named("mapScheduleItem")
    default ScheduleItem mapScheduleItem(Event event) {
        if (event.getEventType() != EventType.SINGLE || event.getSchedules() == null || event.getSchedules().isEmpty()) {
            return null;
        }
        EventSchedule schedule = event.getSchedules().get(0);
        ScheduleItem scheduleItem = new ScheduleItem();
        scheduleItem.setScheduleDate(schedule.getScheduleDate());
        scheduleItem.setStartTime(schedule.getStartTime());
        scheduleItem.setEndTime(schedule.getEndTime());
        return scheduleItem;
    }
}
