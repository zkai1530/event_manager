package com.datn.event_manager.service.Schedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.request.ScheduleRequest;
import com.datn.event_manager.dto.response.EventScheduleResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.ScheduleMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleServiceImpl implements ScheduleService {
    EventScheduleRepository scheduleRepository;
    TicketScheduleRepository ticketScheduleRepository;
    EventRepository eventRepository;
    AuthenticationService authenticationService;
    ScheduleMapper scheduleMapper;

    public boolean isScheduleConflict(List<EventSchedule> existingSchedules, List<ScheduleItem> newSchedules) {
        // add existing schedule and new schedule to list
        List<ScheduleItem> allSchedules = new ArrayList<>();
        for (EventSchedule existingSchedule : existingSchedules) {
            allSchedules.add(ScheduleItem.builder()
                    .scheduleDate(existingSchedule.getScheduleDate())
                    .startTime(existingSchedule.getStartTime())
                    .endTime(existingSchedule.getEndTime())
                    .build());
        }

        for (ScheduleItem newSchedule : newSchedules) {
            // check start time < end time?
            if (!newSchedule.getEndTime().isAfter(newSchedule.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time.");
            }
            allSchedules.add(newSchedule);
        }

        // check if there are any overlapping schedules

        // sort by schedule date and start time
        allSchedules
                .sort(Comparator.comparing(ScheduleItem::getScheduleDate).thenComparing(ScheduleItem::getStartTime));

        for (int i = 0; i < allSchedules.size() - 1; i++) {
            ScheduleItem currSchedule = allSchedules.get(i);
            ScheduleItem nextSchedule = allSchedules.get(i + 1);

            if (currSchedule.getScheduleDate().equals(nextSchedule.getScheduleDate())
                    && !(currSchedule.getStartTime().isAfter(nextSchedule.getEndTime())
                            || currSchedule.getEndTime().isBefore(nextSchedule.getStartTime()))) {
                return true;
            }
        }

        return false;
    }

    @Override
    public List<EventScheduleResponse> getAllSchedulesByEventId(Long eventId) {
        User user = authenticationService.getUserFromToken();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        // check if user is the owner of the event
        if (!event.getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<EventSchedule> schedules = scheduleRepository.findAllByEvent(event);

        return scheduleMapper.toEventScheduleResponse(schedules);
    }

    @Override
    public EventScheduleResponse getScheduleById(Long scheduleId) {
        User user = authenticationService.getUserFromToken();
        EventSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // check if user is the owner of the event
        if (!schedule.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return scheduleMapper.toEventScheduleResponse(schedule);
    }

    @Override
    public void createSchedules(Long eventId, ScheduleRequest request) {
        User user = authenticationService.getUserFromToken();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        // check if user is the owner of the event
        if (!event.getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the event is published, can't edit information
        if (event.getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // check eventType is recurring?
        if (event.getEventType() == EventType.SINGLE) {
            throw new AppException(ErrorCode.EVENT_TYPE_MUST_BE_RECURRING);
        }

        // check conflict schedule
        List<EventSchedule> existingSchedules = scheduleRepository.findAllByEvent(event);
        if (isScheduleConflict(existingSchedules, request.getSchedules())) {
            throw new AppException(ErrorCode.CONFLICT_SCHEDULE);
        }

        // add list schedule of event
        List<EventSchedule> schedulesAdd = request.getSchedules().stream()
                .map(schedule -> EventSchedule.builder()
                        .event(event)
                        .scheduleDate(schedule.getScheduleDate())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .isDisbursed(false)
                        .build())
                .collect(Collectors.toList());

        scheduleRepository.saveAll(schedulesAdd);
    }

    @Override
    public void updateSchedule(Long scheduleId, ScheduleItem newSchedule) {
        User user = authenticationService.getUserFromToken();
        EventSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // check if user is the owner of the event
        if (!schedule.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the event is published, can't edit information
        if (schedule.getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        List<TicketSchedule> ticketSchedules = ticketScheduleRepository.findBySchedule(schedule);
        for (TicketSchedule ticketSchedule : ticketSchedules) {
            if (ticketSchedule.getSold() > 0) {
                throw new IllegalArgumentException(
                        "This schedule has already been purchased for ticket name: "
                                + ticketSchedule.getTicket().getName());
            }
        }

        // check start time < end time?
        if (!newSchedule.getEndTime().isAfter(newSchedule.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        // get all schedules of the event (except the current schedule)
        List<EventSchedule> existingSchedules = scheduleRepository.findAllByEvent(schedule.getEvent()).stream()
                .filter(existingSchedule -> !existingSchedule.getScheduleId().equals(scheduleId))
                .toList();

        // check if the new schedule conflicts with existing schedules
        for (EventSchedule existingSchedule : existingSchedules) {
            if (existingSchedule.getScheduleDate().equals(newSchedule.getScheduleDate())
                    && !(newSchedule.getStartTime().isAfter(existingSchedule.getEndTime())
                            || newSchedule.getEndTime().isBefore(existingSchedule.getStartTime()))) {
                throw new AppException(ErrorCode.CONFLICT_SCHEDULE);
            }
        }

        // update schedule
        schedule.setScheduleDate(newSchedule.getScheduleDate());
        schedule.setEndTime(newSchedule.getEndTime());
        schedule.setStartTime(newSchedule.getStartTime());

        scheduleRepository.save(schedule);
    }

    @Override
    public void deleteSchedule(Long scheduleId) {
        User user = authenticationService.getUserFromToken();
        EventSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // check if user is the owner of the event
        if (!schedule.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the event is published, can't edit information
        if (schedule.getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Check if any ticket for this schedule has sold tickets
        List<TicketSchedule> ticketSchedules = ticketScheduleRepository.findBySchedule(schedule);
        for (TicketSchedule ticketSchedule : ticketSchedules) {
            if (ticketSchedule.getSold() > 0) {
                throw new IllegalArgumentException(
                        "This schedule has already been purchased for ticket name: "
                                + ticketSchedule.getTicket().getName());
            }
        }

        scheduleRepository.delete(schedule);
    }

}
