package com.datn.event_manager.service.Notification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.response.NotificationResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.Notification;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.NotificationMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.NotificationRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.UserRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    EventRepository eventRepository;
    UserRepository userRepository;
    OrderRepository orderRepository;
    SimpMessagingTemplate messagingTemplate;
    NotificationMapper notificationMapper;
    AuthenticationService authenticationService;

    @Override
    public NotificationResponse createNotification(String userId, Long eventId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Event event = eventId != null ? eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND)) : null;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setEvent(event);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        NotificationResponse notificationResponse = notificationMapper.toNotificationResponse(
                notificationRepository.save(notification));

        // send noti by websocket
        messagingTemplate.convertAndSendToUser(
                user.getUserId(),
                "/topic/notifications",
                notificationResponse);

        return notificationResponse;
    }

    // Lập lịch kiểm tra thông báo nhắc nhở sự kiện
    @Override
    @Scheduled(cron = "0 0 * * * *") // Chạy mỗi giờ
    public void checkEventReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<Object[]> schedules = eventRepository.findSchedulesForTomorrow(tomorrow);

        for (Object[] schedule : schedules) {
            Long eventId = (Long) schedule[0];
            Long scheduleId = (Long) schedule[1];
            String eventName = (String) schedule[2];

            List<String> userIds = orderRepository.findUsersByScheduleId(scheduleId);

            for (String userId : userIds) {
                String message = String.format("Nhắc nhở: Sự kiện '%s' sẽ diễn ra vào ngày mai!", eventName);
                createNotification(userId, eventId, message);
            }
        }
    }

    @Override
    public void notifyFollowersOnEventCreation(Long eventId, String creatorId) {
        User user = userRepository.findById(creatorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        List<String> followerIds = userRepository.findFollowersByUserId(creatorId);

        for (String followerId : followerIds) {
            String message = String.format(
                    "Sự kiện '%s' vừa được tạo!", event.getName());
            createNotification(followerId, eventId, message);
        }
    }

    @Override
    public List<NotificationResponse> getNotificationsByUser() {
        User user = authenticationService.getUserFromToken();
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(noti -> notificationMapper.toNotificationResponse(noti))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return notificationMapper.toNotificationResponse(notification);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notificationRepository.deleteById(notificationId);
    }

}
