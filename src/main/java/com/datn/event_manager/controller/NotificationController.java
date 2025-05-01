package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.dto.response.NotificationResponse;
import com.datn.event_manager.service.Notification.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/notifications")
public class NotificationController {
    NotificationService notificationService;

    @GetMapping
    public ResponseEntity<APIResponse> getNotifications() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, notificationService.getNotificationsByUser()));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, notificationService.markAsRead(notificationId)));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<APIResponse> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_NOTIFICATION_SUCCESS, null));
    }
}
