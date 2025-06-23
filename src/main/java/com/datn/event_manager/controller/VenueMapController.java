package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.SeatMapRequest.VenueMapRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.dto.response.seatmap.VenueMapResponse;
import com.datn.event_manager.service.VenueMap.VenueMapService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/venue-map")
public class VenueMapController {
    VenueMapService venueMapService;

    @PostMapping
    public ResponseEntity<APIResponse> createVenueMap(@RequestBody VenueMapRequest request) {
        venueMapService.createVenueMap(request);
        return ResponseEntity.ok(new APIResponse(Message.SIGNUP_SUCCESS, null));
    }

    @PutMapping("/{venueMapId}")
    public ResponseEntity<APIResponse> updateVenueMap(
            @PathVariable Long venueMapId,
            @RequestBody VenueMapRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.SIGNUP_SUCCESS,venueMapService.updateVenueMap(venueMapId, request)));
    }

    @DeleteMapping("/{venueMapId}")
    public ResponseEntity<APIResponse> deleteVenueMap(@PathVariable Long venueMapId) {
        venueMapService.deleteVenueMap(venueMapId);
        return ResponseEntity.ok(new APIResponse(Message.SIGNUP_SUCCESS, null));
    }
}
