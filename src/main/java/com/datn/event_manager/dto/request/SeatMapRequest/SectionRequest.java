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
public class SectionRequest {
    Long sectionId;
    String name;
    Integer totalRows;
    Integer seatsPerRow;
    Double positionX;
    Double positionY;
    Double rotation;
    Double theaterCurve;
    List<SeatRequest> seats;
}
