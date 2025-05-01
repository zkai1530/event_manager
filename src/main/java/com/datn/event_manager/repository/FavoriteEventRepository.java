package com.datn.event_manager.repository;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.FavoriteEvent;
import com.datn.event_manager.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteEventRepository extends JpaRepository<FavoriteEvent, Long> {
    Page<FavoriteEvent> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    boolean existsByUserAndEvent(User user, Event event);

void deleteByUserAndEvent(User user, Event event);

}