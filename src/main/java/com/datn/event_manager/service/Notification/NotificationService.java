package com.datn.event_manager.service.Notification;

import java.util.List;

import com.datn.event_manager.dto.response.NotificationResponse;

public interface NotificationService {
    // thông báo khi người follow publish sự kiện mới
    void notifyFollowersOnEventCreation(Long eventId, String creatorId);

    List<NotificationResponse> getNotificationsByUser();

    NotificationResponse markAsRead(Long notificationId);

    void deleteNotification(Long notificationId);

    // thông báo khi mà gần tới sự kiện (đã mua vế)
    NotificationResponse createNotification(String userId, Long eventId, String message);
    void checkEventReminders();
}
