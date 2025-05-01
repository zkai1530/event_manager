package com.datn.event_manager.service.FavoriteEvent;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.response.FavoriteEventResponse;

public interface FavoriteEventService {
    Page<FavoriteEventResponse> getListFavorites(Pageable pageable);

    void addFavoriteEvent(Long eventId);

    void removeFavoriteEvent(Long eventId);

    boolean isExistFavorite(Long eventId);
}
