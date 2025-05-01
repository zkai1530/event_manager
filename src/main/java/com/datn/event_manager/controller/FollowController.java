package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Follow.FollowService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/follow")
public class FollowController {
    FollowService followService;

    @PostMapping("/{followingId}")
    public ResponseEntity<APIResponse> addFavoriteEvent(@PathVariable String followingId) {
        followService.followUser(followingId);
        return ResponseEntity.ok(new APIResponse(Message.ADD_FOLLOW_SUCCESS, null));
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<APIResponse> removeFavoriteEvent(@PathVariable String followingId) {
        followService.unFollowUser(followingId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_FOLLOW_SUCCESS, null));
    }

    @GetMapping("/is-following/{followingId}")
    public ResponseEntity<APIResponse> isFollowing(@PathVariable String followingId) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, followService.isFollowing(followingId)));
    }
}
