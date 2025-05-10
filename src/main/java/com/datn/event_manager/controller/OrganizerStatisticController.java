package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.OrganizerStatistic.OrganizerStatisticService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/organizer/statistic")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrganizerStatisticController {
    OrganizerStatisticService organizerStatisticService;

    @GetMapping("/dashboard/overview")
    public ResponseEntity<APIResponse> getDashboardOverview() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getOrganizerOverviewStat()));
    }

    @GetMapping("/dashboard/top-tickets-sold")
    public ResponseEntity<APIResponse> getTopTicketsSold() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getTopTicketsSold()));
    }

    @GetMapping("/dashboard/revenue-by-week")
    public ResponseEntity<APIResponse> getRevenueByWeek(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getRevenueByWeek(year, month)));
    }

    @GetMapping("/dashboard/ticket-payment-status")
    public ResponseEntity<APIResponse> getTicketPaymentStatus() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getTicketPaymentStatus()));
    }

    @GetMapping("/dashboard/complaints-by-reason")
    public ResponseEntity<APIResponse> getComplaintsByReason() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getComplaintsByReason()));
    }

    @GetMapping("/dashboard/attendance-status")
    public ResponseEntity<APIResponse> getAttendanceStatus() {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, organizerStatisticService.getAttendanceStatus()));
    }

}
