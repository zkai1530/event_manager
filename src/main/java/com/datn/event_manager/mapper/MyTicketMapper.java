package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.response.MyTicketResponse;
import com.datn.event_manager.entity.Order;

@Mapper(componentModel = "spring")
public interface MyTicketMapper {
    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "schedule.event.imageUrl", target = "eventImageUrl")
    @Mapping(source = "schedule.event.name", target = "eventName")
    @Mapping(source = "schedule.scheduleDate", target = "scheduleDate")
    @Mapping(source = "schedule.startTime", target = "startTime")
    @Mapping(source = "schedule.event.eventLocation", target = "location")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "qrCode", target = "qrCode")
    @Mapping(source = "totalPrice", target = "totalPrice")
    @Mapping(source = "orderId", target = "orderCode")
    @Mapping(target = "tickets", expression = "java(order.getOrderTickets().stream()" +
            ".map(ot -> new com.datn.event_manager.dto.response.TicketItemDetail(ot.getTicket().getName(), ot.getQuantity()))"
            +
            ".collect(java.util.stream.Collectors.toList()))")
    MyTicketResponse toMyTicketResponse(Order order);

    List<MyTicketResponse> toMyTicketResponseList(List<Order> orders);
}