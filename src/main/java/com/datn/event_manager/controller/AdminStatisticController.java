package com.datn.event_manager.controller;

import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.AdminStatistic.AdminStatisticService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/admin/statistic")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminStatisticController {
    AdminStatisticService adminStatisticService;

    @GetMapping("/dashboard/overview")
    public ResponseEntity<APIResponse> getDashboardOverview() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getDashboardOverview()));
    }

    @GetMapping("/dashboard/events-published-by-month")
    public ResponseEntity<APIResponse> getEventsPublishedByYear(@RequestParam int year) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getEventsPublishedByYear(year)));
    }

    @GetMapping("/dashboard/revenue-by-month")
    public ResponseEntity<APIResponse> getRevenueByYear(@RequestParam int year) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getRevenueByYear(year)));
    }

    @GetMapping("/dashboard/top-events")
    public ResponseEntity<APIResponse> getTop5EventsByRevenue(@RequestParam LocalDate startDate, LocalDate endDate) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND,
                        adminStatisticService.getTop5EventsByRevenue(startDate, endDate)));
    }

    @GetMapping("/dashboard/event-counts-by-month")
    public ResponseEntity<APIResponse> getEventCountsByMonth(@RequestParam int year) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getEventCountsByMonth(year)));
    }

    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<APIResponse> getRecentOrders() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getRecentOrders()));
    }

    @GetMapping("/complaint-count-by-reason")
    public ResponseEntity<APIResponse> getComplaintCountByReason() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getComplaintCountByReason()));
    }

    @GetMapping("/order-status-count")
    public ResponseEntity<APIResponse> getOrderCountByStatus(@RequestParam("year") int year,
            @RequestParam("month") int month) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getOrderCountByStatus(year, month)));
    }

    @GetMapping("/canceled-order-rate")
    public ResponseEntity<APIResponse> getCanceledOrderRateByMonth(@RequestParam("year") int year) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, adminStatisticService.getCanceledOrderRateByMonth(year)));
    }
}
