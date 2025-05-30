package com.datn.event_manager.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.EventSearchResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Event.EventService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/event")
public class EventController {
    EventService eventService;

    @NonFinal
    @Value("${event-per-page}")
    int EVENT_PER_PAGE;

    @NonFinal
    @Value("${list-events-by-user-per-page}")
    int LIST_EVENT_PER_PAGE;

    @NonFinal
    @Value("${myticket-per-page}")
    int MYTICKET_PER_PAGE;

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

    // @GetMapping
    // public ResponseEntity<APIResponse> getEventByUser() {
    // return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND,
    // eventService.getEventsByUser()));
    // }

    @GetMapping
    public ResponseEntity<APIResponse> getEventByUser(
            @RequestParam(required = false, defaultValue = "all") String timeFilter,
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, LIST_EVENT_PER_PAGE);
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventsByUser(timeFilter, pageable)));
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

    @GetMapping("/search/{keyword}/result")
    public ResponseEntity<APIResponse> searchByName(
            @PathVariable String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "Toàn quốc") String location,
            @RequestParam(required = false, defaultValue = "false") boolean isFree,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "all") String eventStatus) {

        Pageable pageable = PageRequest.of(page, EVENT_PER_PAGE);
        String searchKeyword = keyword.isEmpty() ? "%" : keyword; // Nếu keyword rỗng, dùng % để lấy tất cả
        Page<EventSearchResponse> searchResult = eventService.searchByName(searchKeyword, location, isFree, startDate,
                endDate, eventStatus, pageable);
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, searchResult));
    }

    @GetMapping("/category-theme")
    public ResponseEntity<APIResponse> getCategoryAndTheme() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getCategoryAndTheme()));
    }

    @PostMapping("/category-theme/{eventId}/{categoryId}/{themeId}")
    public ResponseEntity<APIResponse> addCategoryAndTheme(@PathVariable Long eventId,
            @PathVariable Long categoryId,
            @PathVariable Long themeId) {

        eventService.addCategoryAndTheme(eventId, categoryId, themeId);
        return ResponseEntity
                .ok(new APIResponse(Message.ADD_CATE_AND_THEME_SUCCESS, null));
    }

    @GetMapping("/trending")
    public ResponseEntity<APIResponse> getTrendingEvents() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getTrendingEvents()));
    }

    @GetMapping("/random")
    public ResponseEntity<APIResponse> getRandomEvents() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getRandomEvents()));
    }

    @GetMapping("/by-date")
    public ResponseEntity<APIResponse> getTrendingEvents(@RequestParam String period) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventsByDateRange(period)));
    }

    @GetMapping("/admin/summary")
    public ResponseEntity<APIResponse> getEventSummary() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getEventSummary()));
    }

    @GetMapping("/admin/filtered")
    public ResponseEntity<APIResponse> getFilteredEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, MYTICKET_PER_PAGE);
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, eventService.getFilteredEvents(status, sort, pageable)));
    }

    @GetMapping("/admin/event-theme-count")
    public ResponseEntity<APIResponse> countEventsByTheme() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, eventService.countEventsByTheme()));
    }

    @PatchMapping("/admin/hidden/{eventId}")
    public ResponseEntity<APIResponse> hiddenEvent(@PathVariable Long eventId) {
        eventService.hiddenEvent(eventId);
        return ResponseEntity.ok(new APIResponse(Message.HIDE_EVENT, null));
    }

    @PatchMapping("/admin/unhidden/{eventId}")
    public ResponseEntity<APIResponse> unhiddenEvent(@PathVariable Long eventId) {
        eventService.unhiddenEvent(eventId);
        return ResponseEntity.ok(new APIResponse(Message.UNHIDE_EVENT, null));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<APIResponse> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_EVENT_SUCCESS, null));
    }
}
