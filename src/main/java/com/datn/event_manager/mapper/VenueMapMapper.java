package com.datn.event_manager.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.request.SeatMapRequest.SectionRequest;
import com.datn.event_manager.dto.request.SeatMapRequest.VenueMapRequest;
import com.datn.event_manager.dto.response.seatmap.SectionResponse;
import com.datn.event_manager.dto.response.seatmap.VenueMapResponse;
import com.datn.event_manager.entity.Section;
import com.datn.event_manager.entity.VenueMap;

@Mapper(componentModel = "spring")
public interface VenueMapMapper {
    @Mapping(target = "event.eventId", source = "eventId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "sections", ignore = true)
    VenueMap toEntity(VenueMapRequest request);

    @Mapping(target = "eventId", source = "event.eventId")
    VenueMapResponse toResponse(VenueMap venueMap);

    @Mapping(target = "venueMap", ignore = true)
    @Mapping(target = "seats", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "ticket", ignore = true)
    Section toSectionEntity(SectionRequest request);

    SectionResponse toSectionResponse(Section section);
}
