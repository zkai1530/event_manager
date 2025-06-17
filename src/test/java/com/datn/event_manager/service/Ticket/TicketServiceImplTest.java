package com.datn.event_manager.service.Ticket;

import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.mapper.TicketMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private EventScheduleRepository scheduleRepository;

    @Mock
    private TicketScheduleRepository ticketScheduleRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private TicketMapper ticketMapper;

    private TicketRequest ticketRequest;
    private User user;
    private Event event;
    private EventSchedule schedule;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId("user1");

        ticketRequest = new TicketRequest();
        ticketRequest.setName("VIP Ticket");
        ticketRequest.setDescription("VIP access");
        ticketRequest.setPrice(new BigDecimal("100.00"));
        ticketRequest.setAvailableQuantity(50);
        ticketRequest.setSaleStart(LocalDateTime.now().plusDays(1));
        ticketRequest.setSaleEnd(LocalDateTime.now().plusDays(2));
        ticketRequest.setScheduleIds(List.of(1L));

        event = new Event();
        event.setUser(user);
        event.setIsPublished(false);

        schedule = new EventSchedule();
        schedule.setScheduleId(1L);
        schedule.setEvent(event);
        schedule.setScheduleDate(LocalDate.now().plusDays(2));
        schedule.setStartTime(LocalTime.of(10, 0));

        ticket = new Ticket();
        ticket.setTicketId(1L);
        ticket.setName("VIP Ticket");
        TicketSchedule ticketSchedule = new TicketSchedule();
        ticketSchedule.setTicket(ticket);
        ticketSchedule.setSchedule(schedule);
        ticket.setTicketSchedules(new ArrayList<>(List.of(ticketSchedule)));
    }

    @Test
    void testCreateTicket_Success() {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findAllById(List.of(1L))).thenReturn(List.of(schedule));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);

        // When
        ticketService.createTicket(ticketRequest);

        // Then
        verify(authenticationService).getUserFromToken();
        verify(scheduleRepository).findAllById(List.of(1L));
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    void testCreateTicket_Fail_InvalidSchedule() {
        // Given
        ticketRequest.setScheduleIds(List.of(-1L));
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findAllById(List.of(-1L))).thenReturn(List.of());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ticketService.createTicket(ticketRequest));
        assertEquals("One or many schedules invalid!", exception.getMessage());
        verify(authenticationService).getUserFromToken();
        verify(scheduleRepository).findAllById(List.of(-1L));
        verifyNoInteractions(ticketRepository);
    }

    @Test
    void testCreateTicket_Fail_Unauthorized() {
        // Given
        User differentUser = new User();
        differentUser.setUserId("user2");
        when(authenticationService.getUserFromToken()).thenReturn(differentUser);
        when(scheduleRepository.findAllById(List.of(1L))).thenReturn(List.of(schedule));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> ticketService.createTicket(ticketRequest));
        assertEquals("Access Denied! (unauthorized)", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(scheduleRepository).findAllById(List.of(1L));
        verifyNoInteractions(ticketRepository);
    }

    @Test
    void testUpdateTicket_Success() {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(scheduleRepository.findAllById(List.of(1L))).thenReturn(List.of(schedule));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);

        // When
        ticketService.updateTicket(1L, ticketRequest);

        // Then
        verify(authenticationService).getUserFromToken();
        verify(ticketRepository).findById(1L);
        verify(scheduleRepository).findAllById(List.of(1L));
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    void testUpdateTicket_Fail_ScheduleHasSoldTickets() {
        // Given
        TicketSchedule ticketSchedule = new TicketSchedule();
        ticketSchedule.setSchedule(schedule);
        ticketSchedule.setTicket(ticket);
        ticketSchedule.setSold(1);
        ticket.setTicketSchedules(new ArrayList<>(List.of(ticketSchedule))); // Mutable list
        ticketRequest.setScheduleIds(List.of(2L));
        EventSchedule newSchedule = new EventSchedule();
        newSchedule.setScheduleId(2L);
        newSchedule.setEvent(event);
        newSchedule.setScheduleDate(LocalDate.now().plusDays(3));
        newSchedule.setStartTime(LocalTime.of(12, 0));
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(scheduleRepository.findAllById(List.of(2L))).thenReturn(List.of(newSchedule));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ticketService.updateTicket(1L, ticketRequest));
        assertTrue(exception.getMessage().contains("Schedule on " + schedule.getScheduleDate() + " starting at "
                + schedule.getStartTime() + " has already been purchased for ticket " + ticket.getTicketId()));
        verify(authenticationService).getUserFromToken();
        verify(ticketRepository).findById(1L);
        verify(scheduleRepository).findAllById(List.of(2L));
        verifyNoMoreInteractions(ticketRepository);
    }
}