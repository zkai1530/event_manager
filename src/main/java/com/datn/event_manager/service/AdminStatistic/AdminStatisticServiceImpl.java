package com.datn.event_manager.service.AdminStatistic;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.datn.event_manager.repository.ComplaintRepository;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatisticServiceImpl implements AdminStatisticService {
    EventRepository eventRepository;
    TicketScheduleRepository ticketScheduleRepository;
    OrderRepository orderRepository;
    UserRepository userRepository;
    ComplaintRepository complaintRepository;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> result = new HashMap<>();

        // tổng sự kiện
        result.put("totalEvents", eventRepository.count());

        // tổng vé bán ra
        result.put("totalTicketsSold", ticketScheduleRepository.getTotalTicketsSold());

        // tổng doanh thu
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        result.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // tổng người dùng
        result.put("totalUsers", userRepository.count());

        // tổng khiếu nại
        result.put("totalComplaints", complaintRepository.count());

        // tổng người dùng bị block
        result.put("totalBlockedUsers", userRepository.countByIsActiveFalse());

        // tổng sự kiện bị ẩn
        result.put("totalHiddenEvents", eventRepository.countByIsSuspendedTrue());

        // tỉ lệ check in / số vé bán được
        result.put("checkInRate", ticketScheduleRepository.getCheckInRate());

        return result;
    }

    @Override
    public Map<String, Object> getEventsPublishedByYear(int year) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> counts = eventRepository.countEventsPublishedByYear(year);

        Map<String, Long> monthlyCounts = new HashMap<>();
        // để 12 tháng có giá trị 0
        for (int i = 1; i <= 12; i++) {
            monthlyCounts.put(String.valueOf(i), 0L);
        }

        // đưa kết quả vào các tháng có dữ liệu
        for (Object[] row : counts) {
            monthlyCounts.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        result.put("eventsPublished", monthlyCounts);
        result.put("year", year);
        return result;
    }

    @Override
    public Map<String, Object> getRevenueByYear(int year) {
        Map<String, Object> result = new HashMap<>();
        List<Object[]> revenues = orderRepository.getRevenueByYear(year);

        Map<String, BigDecimal> monthlyRevenues = new HashMap<>();
        // để 12 tháng có giá trị 0
        for (int i = 1; i <= 12; i++) {
            monthlyRevenues.put(String.valueOf(i), BigDecimal.ZERO);
        }
        // đưa kết quả vào các tháng có dữ liệu
        for (Object[] row : revenues) {
            monthlyRevenues.put(row[0].toString(),
                    row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO);
        }
        result.put("revenue", monthlyRevenues);
        result.put("year", year);
        return result;
    }

    @Override
    public Map<String, Object> getTop5EventsByRevenue(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        Pageable pageable = PageRequest.of(0, 5);
        List<Object[]> topEvents = orderRepository.getTop5EventsByRevenue(startDate, endDate, pageable).getContent();
        List<Map<String, Object>> events = topEvents.stream()
                .map(row -> {
                    Map<String, Object> event = new HashMap<>();
                    event.put("name", row[0]);
                    event.put("imageUrl", row[1]);
                    event.put("revenue", row[2]);
                    return event;
                })
                .toList();
        result.put("topEvents", events);
        return result;
    }

}
