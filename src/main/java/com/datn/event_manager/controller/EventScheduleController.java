package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.request.ScheduleRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Schedule.ScheduleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/schedules")
public class EventScheduleController {
    ScheduleService scheduleService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<APIResponse> getAllSchedules(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, scheduleService.getAllSchedulesByEventId(eventId)));
    }
    
    @PostMapping("/event/{eventId}")
    public ResponseEntity<APIResponse> createSchedules(@PathVariable Long eventId, @RequestBody ScheduleRequest request) {
        scheduleService.createSchedules(eventId, request);
        return ResponseEntity.ok(new APIResponse(Message.CREATE_SCHEDULE_SUCCESS, null));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<APIResponse> getScheduleById(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, scheduleService.getScheduleById(scheduleId)));
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<APIResponse> updateSchedule(@PathVariable Long scheduleId, @RequestBody ScheduleItem newSchedule) {
        scheduleService.updateSchedule(scheduleId, newSchedule);
        return ResponseEntity.ok(new APIResponse(Message.UPDATE_SCHEDULE_SUCCESS, null));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<APIResponse> deleteSchedule(@PathVariable Long scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_SCHEDULE_SUCCESS, null));
    }
}
