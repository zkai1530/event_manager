package com.datn.event_manager.service.AdminStatistic;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AdminStatisticService {
    Map<String, Object> getDashboardOverview();

    Map<String, Object> getEventsPublishedByYear(int year);

    Map<String, Object> getRevenueByYear(int year);

    Map<String, Object> getTop5EventsByRevenue(LocalDate startDate, LocalDate endDate);

    List<Map<String, Object>> getEventCountsByMonth(int year);

    List<Map<String, Object>> getRecentOrders();
}
