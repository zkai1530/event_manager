package com.datn.event_manager.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.dto.response.ScheduleDisbursementResponse;
import com.datn.event_manager.service.Disbursement.DisbursementService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/disbursement")
public class DisbursementController {
    DisbursementService disbursementService;

    @NonFinal
    @Value("${list-events-by-user-per-page}")
    int LIST_EVENT_PER_PAGE;

    @GetMapping("/events/{eventId}/schedules")
    public ResponseEntity<APIResponse> getUndisbursedSchedules(@PathVariable Long eventId) {
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, disbursementService.getUndisbursedSchedules(eventId)));
    }

    @PutMapping("/{scheduleId}/confirm")
    public ResponseEntity<APIResponse> disbursed(@PathVariable Long scheduleId) {
        disbursementService.disbursed(scheduleId);
        return ResponseEntity
                .ok(new APIResponse(Message.CONFIRM_DISBURSED, null));
    }

    @GetMapping("/events/eligible-disbursement")
    public ResponseEntity<APIResponse> getEligibleDisbursementEvents(
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, LIST_EVENT_PER_PAGE);
        return ResponseEntity
                .ok(new APIResponse(Message.CONFIRM_DISBURSED,
                        disbursementService.getEligibleDisbursementEvents(pageable)));
    }
}
