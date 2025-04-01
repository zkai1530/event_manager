package com.datn.event_manager.service.Schedule;

import java.util.List;

import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.request.ScheduleRequest;
import com.datn.event_manager.dto.response.EventScheduleResponse;

public interface ScheduleService {
    List<EventScheduleResponse> getAllSchedules(Long eventId);

    void createSchedules(Long eventId, ScheduleRequest request);

    void updateSchedule (Long scheduleId, ScheduleItem schedule);

    void deleteSchedule (Long scheduleId);
}
