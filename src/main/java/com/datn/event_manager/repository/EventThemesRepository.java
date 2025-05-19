package com.datn.event_manager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.dto.response.admin_statistic.ThemeEventCountResponse;
import com.datn.event_manager.entity.EventThemes;

public interface EventThemesRepository extends JpaRepository<EventThemes, Long> {
    // đếm số sự kiện theo theme
    @Query("SELECT new com.datn.event_manager.dto.response.admin_statistic.ThemeEventCountResponse(t.themeName, COALESCE(COUNT(e.eventId), 0)) "
            +
            "FROM EventThemes t LEFT JOIN Event e ON e.theme.themeId = t.themeId " +
            "GROUP BY t.themeId, t.themeName")
    List<ThemeEventCountResponse> countEventsByTheme();
}
