package com.datn.event_manager.dto.response.seatmap;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VenueMapResponse {
    Long venueMapId;
    Long eventId;
    Double stagePositionX;
    Double stagePositionY;
    Double stageWidth;
    Double stageHeight;
    List<SectionResponse> sections;
}
