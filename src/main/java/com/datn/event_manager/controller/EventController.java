package com.datn.event_manager.controller;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Cloudinary.CloudinaryService;
import com.datn.event_manager.service.Event.EventService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/event")
public class EventController {
    EventService eventService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse> createEvent(@RequestPart("eventRequest") EventRequest eventRequest,
            @RequestPart(value = "image", required = false) MultipartFile file) {
        return ResponseEntity
                .ok(new APIResponse(Message.CREATE_EVENT_SUCCESS, eventService.createEvent(eventRequest, file)));
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse> getAllEvents() {
        return ResponseEntity.ok(new APIResponse(Message.CREATE_EVENT_SUCCESS, eventService.getAllEvents()));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<APIResponse> getEventById(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventById(eventId)));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<APIResponse> updateEvent(@PathVariable Long eventId,
            @RequestPart("eventRequest") EventRequest eventRequest,
            @RequestPart(value = "image", required = false) MultipartFile file) {
        return ResponseEntity
                .ok(new APIResponse(Message.UPDATE_EVENT_SUCCESS, eventService.updateEvent(eventId,
                        eventRequest, file)));
    }

    @GetMapping
    public ResponseEntity<APIResponse> getEventByUser() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventsByUser()));
    }

    @GetMapping("/event-status/{eventId}")
    public ResponseEntity<APIResponse> getEventStatus(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventStatus(eventId)));
    }

    @PostMapping("/publish/{eventId}")
    public ResponseEntity<APIResponse> publishEvent(@PathVariable Long eventId) {
        eventService.publishEvent(eventId);
        return ResponseEntity
                .ok(new APIResponse(Message.EVENT_PUBLISHED_SUCCESSFULLY, null));
    }

    @PostMapping("/unpublish/{eventId}")
    public ResponseEntity<APIResponse> unpublishEvent(@PathVariable Long eventId) {
        eventService.unpublishEvent(eventId);
        return ResponseEntity
                .ok(new APIResponse(Message.EVENT_UNPUBLISHED_SUCCESSFULLY, null));
    }

}
