package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.Notification;
import com.datn.event_manager.entity.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalse(User user);

}
