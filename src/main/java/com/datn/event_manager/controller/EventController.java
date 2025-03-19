package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
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

    @PostMapping
    public ResponseEntity<APIResponse> createEvent (@RequestBody EventRequest eventRequest) {
        return ResponseEntity.ok(new APIResponse(Message.CREATE_EVENT_SUCCESS, eventService.createEvent(eventRequest)));
    }

    @GetMapping
    public ResponseEntity<APIResponse> getAllEvents () {
        return ResponseEntity.ok(new APIResponse(Message.CREATE_EVENT_SUCCESS, eventService.getAllEvents()));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<APIResponse> getEventById (@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventById(eventId)));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<APIResponse> updateEvent (@PathVariable Long eventId, @RequestBody EventRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.updateEvent(eventId, request)));
    }
}
