package com.datn.event_manager.service.AdminStatistic;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.datn.event_manager.entity.CancelReason;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.repository.CancelReasonRepository;
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
    CancelReasonRepository cancelReasonRepository;

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

    @Override
    public List<Map<String, Object>> getEventCountsByMonth(int year) {
        List<Object[]> results = eventRepository.countEventsByMonth(year);

        // để 12 tháng có giá trị 0
        List<Map<String, Object>> monthlyCounts = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month);
            monthData.put("completedEvents", 0L);
            monthData.put("upcomingEvents", 0L);
            monthlyCounts.add(monthData);
        }

        // đưa kết quả vào các tháng có dữ liệu
        for (Object[] result : results) {
            int month = ((Number) result[0]).intValue();
            long completedEvents = ((Number) result[1]).longValue();
            long upcomingEvents = ((Number) result[2]).longValue();
            Map<String, Object> monthData = monthlyCounts.get(month - 1);
            monthData.put("completedEvents", completedEvents);
            monthData.put("upcomingEvents", upcomingEvents);
        }

        return monthlyCounts;
    }

    @Override
    public List<Map<String, Object>> getRecentOrders() {
        List<Object[]> results = orderRepository.findRecentOrders();
        return results.stream()
                .map(row -> {
                    Map<String, Object> orderData = new HashMap<>();
                    orderData.put("avatarUrl", row[0]);
                    orderData.put("userName", row[1]);
                    orderData.put("email", row[2]);
                    orderData.put("totalPrice", row[3]);
                    orderData.put("status", row[4]);
                    orderData.put("eventName", row[5]);
                    orderData.put("scheduleDate", row[6]);
                    orderData.put("startTime", row[7]);
                    orderData.put("endTime", row[8]);
                    orderData.put("eventImageUrl", row[9]);
                    orderData.put("createAt", row[10]);
                    return orderData;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getComplaintCountByReason() {
        Map<String, Long> complaintCounts = new HashMap<>();

        // để các reason có giá trị 0
        List<CancelReason> reasons = cancelReasonRepository.findAll();
        for (CancelReason reason : reasons) {
            complaintCounts.put(reason.getReasonName(), 0L);
        }

        List<Object[]> results = complaintRepository.countComplaintsByReason();
        for (Object[] result : results) {
            String reasonName = (String) result[0];
            Long count = (Long) result[1];
            complaintCounts.put(reasonName, count);
        }

        return complaintCounts;
    }

    @Override
    public Map<String, Long> getOrderCountByStatus(int year, int month) {
        Map<String, Long> orderCounts = new HashMap<>();
        orderCounts.put("PAID", 0L);
        orderCounts.put("PENDING", 0L);
        orderCounts.put("CANCELED", 0L);

        List<Object[]> results = orderRepository.countOrdersByStatus(year, month);
        for (Object[] result : results) {
            OrderStatus status = (OrderStatus) result[0];
            Long count = (Long) result[1];
            orderCounts.put(status.name(), count);
        }
        return orderCounts;
    }

    @Override
    public Map<Integer, Double> getCanceledOrderRateByMonth(int year) {
        Map<Integer, Double> rates = new HashMap<>();

        // để 12 tháng có giá trị 0
        for (int i = 1; i <= 12; i++) {
            rates.put(i, 0.0);
        }

        List<Object[]> results = orderRepository.countOrdersAndCanceledByMonth(year);
        for (Object[] result : results) {
            Integer month = (Integer) result[0];
            Long totalOrders = (Long) result[1];
            Long canceledOrders = (Long) result[2];
            
            Double ratio = totalOrders > 0 ? (canceledOrders * 100.0 / totalOrders) : 0.0;
            rates.put(month, ratio);
        }
        return rates;
    }

}
