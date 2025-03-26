package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.response.TicketResponse;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(source = "ticket.ticketId", target = "id")
    @Mapping(source = "ticket.name", target = "name")
    @Mapping(source = "ticket.price", target = "price")
    @Mapping(source = "ticket.sold", target = "sold")
    @Mapping(source = "ticket.availableQuantity", target = "availableQuantity")
    @Mapping(source = "ticket.saleStart", target = "saleStart")
    @Mapping(source = "ticket.saleEnd", target = "saleEnd")
    TicketResponse toTicketScheduleResponse(TicketSchedule ticketSchedule);

    @Mapping(source = "ticket.ticketId", target = "id")
    TicketResponse toTicketResponse(Ticket ticket);
    List<TicketResponse> toTicketResponseList(List<Ticket> ticket);
}
