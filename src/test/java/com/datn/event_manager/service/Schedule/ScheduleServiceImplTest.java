package com.datn.event_manager.service.Schedule;

import com.datn.event_manager.dto.request.ScheduleRequest;
import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.mapper.ScheduleMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventScheduleRepository scheduleRepository;

    @Mock
    private TicketScheduleRepository ticketScheduleRepository;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private ScheduleMapper scheduleMapper;

    private ScheduleRequest scheduleRequest;
    private ScheduleItem scheduleItem;
    private User user;
    private Event event;
    private EventSchedule eventSchedule;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId("user1");

        scheduleItem = new ScheduleItem();
        scheduleItem.setScheduleDate(LocalDate.now().plusDays(1));
        scheduleItem.setStartTime(LocalTime.of(10, 0));
        scheduleItem.setEndTime(LocalTime.of(12, 0));

        scheduleRequest = new ScheduleRequest();
        scheduleRequest.setSchedules(List.of(scheduleItem));

        event = new Event();
        event.setEventId(1L);
        event.setUser(user);
        event.setEventType(EventType.RECURRING);
        event.setIsPublished(false);

        eventSchedule = new EventSchedule();
        eventSchedule.setScheduleId(1L);
        eventSchedule.setEvent(event);
        eventSchedule.setScheduleDate(LocalDate.now().plusDays(1));
        eventSchedule.setStartTime(LocalTime.of(10, 0));
        eventSchedule.setEndTime(LocalTime.of(12, 0));
    }

    @Test
    void testCreateSchedules_Success() {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(scheduleRepository.findAllByEvent(event)).thenReturn(List.of());
        when(scheduleRepository.saveAll(anyList())).thenReturn(List.of(eventSchedule));

        // When
        scheduleService.createSchedules(1L, scheduleRequest);

        // Then
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verify(scheduleRepository).findAllByEvent(event);
        verify(scheduleRepository).saveAll(anyList());
    }

    @Test
    void testCreateSchedules_Fail_Unauthorized() {
        // Given
        User differentUser = new User();
        differentUser.setUserId("user2");
        when(authenticationService.getUserFromToken()).thenReturn(differentUser);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> scheduleService.createSchedules(1L, scheduleRequest));
        assertEquals("Access Denied! (unauthorized)", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verifyNoInteractions(scheduleRepository);
    }

    @Test
    void testCreateSchedules_Fail_ConflictSchedule() {
        // Given
        EventSchedule existingSchedule = new EventSchedule();
        existingSchedule.setScheduleDate(LocalDate.now().plusDays(1));
        existingSchedule.setStartTime(LocalTime.of(10, 0));
        existingSchedule.setEndTime(LocalTime.of(12, 0));
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(scheduleRepository.findAllByEvent(event)).thenReturn(List.of(existingSchedule));

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> scheduleService.createSchedules(1L, scheduleRequest));
        assertEquals("Schedule conflict detected!", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verify(scheduleRepository).findAllByEvent(event);
    }

    @Test
    void testUpdateSchedule_Success() {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(eventSchedule));
        when(scheduleRepository.findAllByEvent(event)).thenReturn(List.of());
        when(ticketScheduleRepository.findBySchedule(eventSchedule)).thenReturn(List.of());
        when(scheduleRepository.save(any(EventSchedule.class))).thenReturn(eventSchedule);

        // When
        scheduleService.updateSchedule(1L, scheduleItem);

        // Then
        verify(authenticationService).getUserFromToken();
        verify(scheduleRepository).findById(1L);
        verify(scheduleRepository).findAllByEvent(event);
        verify(ticketScheduleRepository).findBySchedule(eventSchedule);
        verify(scheduleRepository).save(any(EventSchedule.class));
    }

    @Test
    void testUpdateSchedule_Fail_SoldTickets() {
        // Given
        TicketSchedule ticketSchedule = new TicketSchedule();
        ticketSchedule.setSold(1);
        ticketSchedule.setTicket(new Ticket());
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(eventSchedule));
        when(ticketScheduleRepository.findBySchedule(eventSchedule)).thenReturn(List.of(ticketSchedule));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> scheduleService.updateSchedule(1L, scheduleItem));
        assertTrue(exception.getMessage().contains("has already been purchased"));
        verify(authenticationService).getUserFromToken();
        verify(scheduleRepository).findById(1L);
        verify(ticketScheduleRepository).findBySchedule(eventSchedule);
        verifyNoMoreInteractions(scheduleRepository);
    }
}