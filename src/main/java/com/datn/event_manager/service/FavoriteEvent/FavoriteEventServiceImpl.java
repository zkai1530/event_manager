package com.datn.event_manager.service.FavoriteEvent;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.response.FavoriteEventResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.FavoriteEvent;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.EventMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.FavoriteEventRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FavoriteEventServiceImpl implements FavoriteEventService {
    AuthenticationService authenticationService;
    FavoriteEventRepository favoriteEventRepository;
    EventMapper eventMapper;
    EventRepository eventRepository;

    @Override
    public Page<FavoriteEventResponse> getListFavorites(Pageable pageable) {
        User user = authenticationService.getUserFromToken();
        return favoriteEventRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(favoriteEvent -> eventMapper.toFavoriteEventResponse(favoriteEvent));
    }

    @Override
    public void addFavoriteEvent(Long eventId) {
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (favoriteEventRepository.existsByUserAndEvent(user, event)) {
            throw new AppException(ErrorCode.ALREADY_FAVORITED);
        }

        FavoriteEvent favoriteEvent = FavoriteEvent.builder()
                .event(event)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        favoriteEventRepository.save(favoriteEvent);
    }

    @Override
    @Transactional
    public void removeFavoriteEvent(Long eventId) {
        User user = authenticationService.getUserFromToken();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!favoriteEventRepository.existsByUserAndEvent(user, event)) {
            throw new AppException(ErrorCode.FAVORITE_NOT_FOUND);
        }

        favoriteEventRepository.deleteByUserAndEvent(user, event);
    }

    @Override
    public boolean isExistFavorite(Long eventId) {
        User user = authenticationService.getUserFromToken();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        return favoriteEventRepository.existsByUserAndEvent(user, event);
    }
}
