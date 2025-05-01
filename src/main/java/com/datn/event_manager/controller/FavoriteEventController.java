package com.datn.event_manager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.FavoriteEvent.FavoriteEventService;

import lombok.experimental.NonFinal;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/favorite")
public class FavoriteEventController {
    FavoriteEventService favoriteEventService;

    @NonFinal
    @Value("${favorite-per-page}")
    int FAVORITE_PER_PAGE;

    @GetMapping
    public ResponseEntity<APIResponse> getListFavorites(
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, FAVORITE_PER_PAGE);
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND,
                favoriteEventService.getListFavorites(pageable)));
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<APIResponse> addFavoriteEvent(@PathVariable Long eventId) {
        favoriteEventService.addFavoriteEvent(eventId);
        return ResponseEntity.ok(new APIResponse(Message.ADD_FAVORITE_SUCCESS, null));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<APIResponse> removeFavoriteEvent(@PathVariable Long eventId) {
        favoriteEventService.removeFavoriteEvent(eventId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_FAVORITE_SUCCESS, null));
    }

    @GetMapping("/is-existing/{eventId}")
    public ResponseEntity<APIResponse> isExistFavorite(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, favoriteEventService.isExistFavorite(eventId)));
    }
}
