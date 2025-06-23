package com.datn.event_manager.dto.request.SeatMapRequest;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VenueMapRequest {
    Long eventId;
    Double stagePositionX;
    Double stagePositionY;
    Double stageWidth;
    Double stageHeight;
    List<SectionRequest> sections;
}
