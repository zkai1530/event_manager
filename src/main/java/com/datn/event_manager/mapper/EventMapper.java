package com.datn.event_manager.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.response.DisbursementEligibleEventResponse;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.dto.response.EventScheduleResponse;
import com.datn.event_manager.dto.response.EventScheduleSearchResponse;
import com.datn.event_manager.dto.response.EventSearchResponse;
import com.datn.event_manager.dto.response.FavoriteEventResponse;
import com.datn.event_manager.dto.response.TicketResponse;
import com.datn.event_manager.dto.response.TicketSearchResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.FavoriteEvent;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.enums.EventType;

@Mapper(componentModel = "spring", uses = { TicketMapper.class, ScheduleMapper.class })
public interface EventMapper {
    @Named("toEventResponse")
    @Mapping(target = "userId", source = "user.userId")
    EventResponse toEventResponse(Event event);

    @IterableMapping(qualifiedByName = "toEventResponse")
    List<EventResponse> toEventResponse(List<Event> event);

    @Mapping(target = "totalTicketsSold", ignore = true)
    @Mapping(target = "scheduleItem", source = ".", qualifiedByName = "mapScheduleItem")
    EventByUserResponse toEventByUserResponse(Event event);

    List<EventByUserResponse> toEventByUserResponseList(List<Event> events);

    @Named("toEligibleEventResponse")
    @Mapping(target = "eventName", source = "name")
    DisbursementEligibleEventResponse toEligibleEventResponse(Event event);

    @IterableMapping(qualifiedByName = "toEligibleEventResponse")
    List<DisbursementEligibleEventResponse> toEligibleEventResponse(List<Event> events);

    @Named("mapScheduleItem")
    default ScheduleItem mapScheduleItem(Event event) {
        if (event.getEventType() != EventType.SINGLE || event.getSchedules() == null
                || event.getSchedules().isEmpty()) {
            return null;
        }
        EventSchedule schedule = event.getSchedules().get(0);
        ScheduleItem scheduleItem = new ScheduleItem();
        scheduleItem.setScheduleDate(schedule.getScheduleDate());
        scheduleItem.setStartTime(schedule.getStartTime());
        scheduleItem.setEndTime(schedule.getEndTime());
        return scheduleItem;
    }

    @Mapping(target = "eventId", source = "event.eventId")
    @Mapping(target = "name", source = "event.name")
    @Mapping(target = "imageUrl", source = "event.imageUrl")
    @Mapping(target = "slug", source = "event.slug")
    @Mapping(target = "eventType", source = "event.eventType")
    @Mapping(target = "eventLocation", source = "event.eventLocation")
    @Mapping(target = "nearestSchedule", source = "event.schedules", qualifiedByName = "mapNearestScheduleWithTickets")
    @Mapping(target = "cheapestTicketPrice", source = "event.schedules", qualifiedByName = "mapCheapestTicketPrice")
    FavoriteEventResponse toFavoriteEventResponse(FavoriteEvent favoriteEvent);

    @Named("mapNearestScheduleWithTickets")
    default EventScheduleResponse mapNearestScheduleWithTickets(List<EventSchedule> schedules) {
        if (schedules == null || schedules.isEmpty()) {
            return null;
        }
        LocalDate currentDate = LocalDate.now();
        return schedules.stream()
                .filter(schedule -> schedule.getScheduleDate() != null
                        && schedule.getScheduleDate().isAfter(currentDate))
                .filter(schedule -> schedule.getTicketSchedules() != null && !schedule.getTicketSchedules().isEmpty())
                .min(Comparator.comparing(EventSchedule::getScheduleDate))
                .map(schedule -> {
                    // Tạo EventScheduleResponse thủ công
                    EventScheduleResponse response = new EventScheduleResponse();
                    response.setScheduleId(schedule.getScheduleId());
                    response.setScheduleDate(schedule.getScheduleDate());
                    response.setStartTime(schedule.getStartTime());
                    response.setEndTime(schedule.getEndTime());
                    // Ánh xạ ticketSchedules từ List<TicketSchedule> sang List<TicketResponse>
                    List<TicketSchedule> ticketSchedules = schedule.getTicketSchedules();
                    if (ticketSchedules != null && !ticketSchedules.isEmpty()) {
                        List<TicketResponse> ticketResponses = ticketSchedules.stream()
                                .map(TicketSchedule::getTicket)
                                .filter(ticket -> ticket != null)
                                .map(ticket -> {
                                    // Tạo TicketResponse thủ công để tránh gọi TicketMapper
                                    TicketResponse ticketResponse = new TicketResponse();
                                    ticketResponse.setId(ticket.getTicketId());
                                    ticketResponse.setName(ticket.getName());
                                    ticketResponse.setDescription(ticket.getDescription());
                                    ticketResponse.setSold(ticket.getSold());
                                    ticketResponse.setPrice(ticket.getPrice());
                                    ticketResponse.setAvailableQuantity(ticket.getAvailableQuantity());
                                    ticketResponse.setSaleStart(ticket.getSaleStart());
                                    ticketResponse.setSaleEnd(ticket.getSaleEnd());
                                    ticketResponse.setDiscounts(null); // Không in discounts
                                    return ticketResponse;
                                })
                                .toList();
                        response.setTicketSchedules(ticketResponses);
                    } else {
                        response.setTicketSchedules(null);
                    }
                    return response;
                })
                .orElse(null);
    }

    @Named("mapCheapestTicketPrice")
    default BigDecimal mapCheapestTicketPrice(List<EventSchedule> schedules) {
        if (schedules == null || schedules.isEmpty()) {
            return null;
        }
        LocalDate currentDate = LocalDate.now();
        return schedules.stream()
                .filter(schedule -> schedule.getScheduleDate() != null
                        && schedule.getScheduleDate().isAfter(currentDate))
                .filter(schedule -> schedule.getTicketSchedules() != null && !schedule.getTicketSchedules().isEmpty())
                .min(Comparator.comparing(EventSchedule::getScheduleDate))
                .map(schedule -> {
                    List<TicketSchedule> ticketSchedules = schedule.getTicketSchedules();
                    return ticketSchedules.stream()
                            .map(TicketSchedule::getTicket)
                            .filter(ticket -> ticket != null && ticket.getPrice() != null)
                            .map(Ticket::getPrice)
                            .min(BigDecimal::compareTo)
                            .orElse(null);
                })
                .orElse(null);
    }

    @Named("toEventSearchResponse")
    @Mapping(target = "eventId", source = "eventId")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "summary", source = "summary")
    @Mapping(target = "eventType", source = "eventType")
    @Mapping(target = "eventLocation", source = "eventLocation")
    @Mapping(target = "schedules", source = "schedules", qualifiedByName = "mapSchedulesToSearchResponse")
    EventSearchResponse toEventSearchResponse(Event event);

    @IterableMapping(qualifiedByName = "toEventSearchResponse")
    List<EventSearchResponse> toEventSearchResponseList(List<Event> events);

    @Named("mapSchedulesToSearchResponse")
    default List<EventScheduleSearchResponse> mapSchedulesToSearchResponse(List<EventSchedule> schedules) {
        if (schedules == null || schedules.isEmpty()) {
            return Collections.emptyList();
        }
        return schedules.stream()
                .filter(schedule -> schedule.getScheduleDate() != null)
                .sorted(Comparator.comparing(EventSchedule::getScheduleDate))
                .map(schedule -> {
                    EventScheduleSearchResponse response = new EventScheduleSearchResponse();
                    response.setScheduleDate(schedule.getScheduleDate());
                    List<TicketSearchResponse> ticketResponses = schedule.getTicketSchedules() != null
                            ? schedule.getTicketSchedules().stream()
                                    .map(ticketSchedule -> {
                                        TicketSearchResponse ticketResponse = new TicketSearchResponse();
                                        ticketResponse.setPrice(ticketSchedule.getTicket() != null
                                                ? ticketSchedule.getTicket().getPrice()
                                                : BigDecimal.ZERO);
                                        return ticketResponse;
                                    })
                                    .collect(Collectors.toList())
                            : Collections.emptyList();
                    response.setTicketSchedules(ticketResponses);
                    return response;
                })
                .collect(Collectors.toList());
    }
}
