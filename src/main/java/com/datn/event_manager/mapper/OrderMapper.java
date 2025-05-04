package com.datn.event_manager.mapper;

import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.OrderTicketResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderDetailResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderTicketResponse1;
import com.datn.event_manager.dto.response.ticketsales.TicketScheduleResponse;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.TicketSchedule;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

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

    // dưới đây là dùng orderticketrepsonse1
    @Named("toTicketScheduleResponse")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "ticketName", source = "ticket.name")
    @Mapping(target = "sold", source = "sold")
    @Mapping(target = "availableQuantity", source = "availableQuantity")
    @Mapping(target = "price", source = "ticket.price")
    TicketScheduleResponse toTicketScheduleResponse(TicketSchedule ticketSchedule);

    @IterableMapping(qualifiedByName = "toTicketScheduleResponse")
    List<TicketScheduleResponse> toTicketScheduleResponseList(List<TicketSchedule> ticketSchedules);

    @Named("toOrderDetailResponse")
    @Mapping(target = "orderId", source = "orderId")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "orderTickets", source = "orderTickets", qualifiedByName = "mapOrderTicketsToOrderTicketResponse1")
    OrderDetailResponse toOrderDetailResponse(Order order);

    @IterableMapping(qualifiedByName = "toOrderDetailResponse")
    List<OrderDetailResponse> toOrderDetailResponseList(List<Order> orders);

    @Named("mapToOrderTicketResponse1")
    @Mapping(target = "ticketId", source = "ticket.ticketId")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "priceAtPurchase", source = "priceAtPurchase")
    OrderTicketResponse1 mapToOrderTicketResponse1(OrderTicket orderTicket);

    @Named("mapOrderTicketsToOrderTicketResponse1")
    default List<OrderTicketResponse1> mapOrderTicketsToOrderTicketResponse1(List<OrderTicket> orderTickets) {
        if (orderTickets == null)
            return null;
        return orderTickets.stream()
                .map(this::mapToOrderTicketResponse1)
                .collect(Collectors.toList());
    }   
}
