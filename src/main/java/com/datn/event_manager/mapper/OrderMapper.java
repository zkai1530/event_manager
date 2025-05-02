package com.datn.event_manager.mapper;

import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.OrderTicketResponse;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.OrderTicket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    @Mapping(target = "eventName", expression = "java(order.getSchedule().getEvent().getName())")
    @Mapping(target = "scheduleDate", expression = "java(order.getSchedule().getScheduleDate())")
    @Mapping(target = "startTime", expression = "java(order.getSchedule().getStartTime())")
    @Mapping(target = "endTime", expression = "java(order.getSchedule().getEndTime())")
    @Mapping(target = "totalQuantity", expression = "java(order.getOrderTickets().stream().mapToInt(OrderTicket::getQuantity).sum())")
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "ticketName", source = "ticket.name")
    @Mapping(target = "ticketId", source = "ticket.ticketId")
    OrderTicketResponse toOrderTicketResponse(OrderTicket orderTicket);
}
