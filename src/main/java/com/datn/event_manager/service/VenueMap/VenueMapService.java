package com.datn.event_manager.service.VenueMap;

import com.datn.event_manager.dto.request.SeatMapRequest.VenueMapRequest;
import com.datn.event_manager.dto.response.seatmap.VenueMapResponse;

public interface VenueMapService {
    public void createVenueMap(VenueMapRequest request);

    public VenueMapResponse updateVenueMap(Long venueMapId, VenueMapRequest request);

    public void deleteVenueMap(Long venueMapId);

    public VenueMapResponse getVenueMap(Long venueMapId);
}
