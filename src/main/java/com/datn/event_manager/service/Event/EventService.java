package com.datn.event_manager.service.Event;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.response.CategoryAndThemeResponse;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventHomepageResponse;
import com.datn.event_manager.dto.response.EventInAdminResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.dto.response.EventSearchResponse;
import com.datn.event_manager.dto.response.EventStatusResponse;
import com.datn.event_manager.dto.response.admin_statistic.ThemeEventCountResponse;

public interface EventService {
    String createEvent(EventRequest eventRequest, MultipartFile file);

    List<EventResponse> getAllEvents();

    EventResponse getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest, MultipartFile file);

    Page<EventByUserResponse> getEventsByUser(String timeFilter, Pageable pageable);
    // List<EventByUserResponse> getEventsByUser();

    EventByUserResponse getEventByUser();

    EventStatusResponse getEventStatus(Long eventId);

    void publishEvent(Long eventId);

    void unpublishEvent(Long eventId);

    Page<EventSearchResponse> searchByName(String keyword, String location, boolean isFree, LocalDate startDate,
            LocalDate endDate, String eventStatus, Pageable pageable);

    List<CategoryAndThemeResponse> getCategoryAndTheme();

    void addCategoryAndTheme(Long eventId, Long categoryId, Long themeId);

    List<EventHomepageResponse> getTrendingEvents();
    List<EventHomepageResponse> getRandomEvents();
    List<EventHomepageResponse> getEventsByDateRange(String period);

    Map<String, Object> getEventSummary();
    
    Page<EventInAdminResponse> getFilteredEvents(String status, String sort, Pageable pageable);

    List<ThemeEventCountResponse> countEventsByTheme();

    void hiddenEvent(Long eventId);

    void unhiddenEvent(Long eventId);

    void deleteEvent(Long eventId);

    
}
