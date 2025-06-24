package com.datn.event_manager.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.datn.event_manager.dto.response.TicketResponse;
import com.datn.event_manager.entity.Section;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;

@Mapper(componentModel = "spring", uses = DiscountMapper.class)
public interface TicketMapper {

    @Mapping(source = "ticket.ticketId", target = "id")
    @Mapping(source = "ticket.name", target = "name")
    @Mapping(source = "ticket.description", target = "description")
    @Mapping(source = "ticket.price", target = "price")
    @Mapping(source = "sold", target = "sold")
    @Mapping(source = "availableQuantity", target = "availableQuantity")
    @Mapping(source = "reservedQuantity", target = "reservedQuantity")
    @Mapping(source = "ticket.saleStart", target = "saleStart")
    @Mapping(source = "ticket.saleEnd", target = "saleEnd")
    @Mapping(source = "ticket.ticketDiscounts", target = "discounts")
    @Mapping(target = "sectionIds", source = "ticketSchedule.ticket.sections", qualifiedByName = "mapSectionIds")
    TicketResponse toTicketScheduleResponse(TicketSchedule ticketSchedule);

    @Mapping(source = "ticket.ticketId", target = "id")
    @Mapping(source = "ticket.ticketDiscounts", target = "discounts")
    @Mapping(target = "sectionIds", source = "ticket.sections", qualifiedByName = "mapSectionIds")
    TicketResponse toTicketResponse(Ticket ticket);
    List<TicketResponse> toTicketResponseList(List<Ticket> ticket);

    @Named("mapSectionIds")
    default List<Long> mapSectionIds(List<Section> sections) {
        if (sections == null) {
            return List.of(); 
        }
        return sections.stream()
            .map(Section::getSectionId)
            .collect(Collectors.toList());
    }
}
