package com.datn.event_manager.service.Event;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.request.EventLocationRequest;
import com.datn.event_manager.dto.request.FAQRequest;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.entity.*;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.mapper.EventMapper;
import com.datn.event_manager.repository.*;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.service.Cloudinary.CloudinaryService;
import com.datn.event_manager.service.Notification.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @InjectMocks
    private EventServiceImpl eventService;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventLocationRepository eventLocationRepository;

    @Mock
    private EventScheduleRepository eventScheduleRepository;

    @Mock
    private FAQRepository faqRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketScheduleRepository ticketScheduleRepository;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EventMapper eventMapper;

    private EventRequest eventRequest;
    private User user;
    private Event event;
    private MultipartFile image;
    private EventResponse eventResponse;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId("user1");

        eventRequest = new EventRequest();
        eventRequest.setName("Test Event");
        eventRequest.setSummary("Summary");
        eventRequest.setDescription("Description");
        eventRequest.setCapacity(100);
        eventRequest.setEventType(EventType.SINGLE);
        eventRequest.setEventDate(LocalDate.now().plusDays(1));
        eventRequest.setStartTime(LocalTime.of(10, 0));
        eventRequest.setEndTime(LocalTime.of(12, 0));
        eventRequest.setEventLocationRequest(new EventLocationRequest("Hanoi", "123 Street", "10000", "Vietnam"));
        eventRequest.setFaqs(List.of(new FAQRequest(null, "Question?", "Answer")));

        event = new Event();
        event.setEventId(1L);
        event.setUser(user);
        event.setName("Test Event");
        event.setSlug("test-event-1");
        event.setIsPublished(false);
        EventSchedule schedule = new EventSchedule();
        schedule.setScheduleId(1L);
        event.setSchedules(new ArrayList<>(List.of(schedule))); 
        event.setFaqs(new ArrayList<>()); 

        image = mock(MultipartFile.class);

        eventResponse = new EventResponse();
        eventResponse.setEventId(1L);
        eventResponse.setName("Test Event");
    }

    @Test
    void testCreateEvent_Success() throws IOException {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(cloudinaryService.uploadImage(any())).thenReturn("http://image.url");
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event savedEvent = invocation.getArgument(0);
            savedEvent.setEventId(1L);
            savedEvent.setSlug("test-event-1");
            return savedEvent;
        });
        when(eventLocationRepository.save(any(EventLocation.class))).thenReturn(new EventLocation());
        when(eventScheduleRepository.save(any(EventSchedule.class))).thenReturn(new EventSchedule());
        when(faqRepository.saveAll(anyList())).thenReturn(List.of());

        // When
        String eventId = eventService.createEvent(eventRequest, image);

        // Then
        assertEquals("1", eventId);
        verify(authenticationService).getUserFromToken();
        verify(cloudinaryService).uploadImage(any());
        verify(eventRepository, times(2)).save(any(Event.class));
        verify(eventLocationRepository).save(any(EventLocation.class));
        verify(eventScheduleRepository).save(any(EventSchedule.class));
        verify(faqRepository).saveAll(anyList());
    }

    @Test
    void testCreateEvent_Fail_DateTimeNull() {
        // Given
        eventRequest.setEventDate(null);
        when(authenticationService.getUserFromToken()).thenReturn(user);

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> eventService.createEvent(eventRequest, image));
        assertEquals("Datetime is null!", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
    }

    @Test
    void testCreateEvent_Fail_UploadImageFailed() throws IOException {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(cloudinaryService.uploadImage(any())).thenThrow(new IOException());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> eventService.createEvent(eventRequest, image));
        assertEquals("Upload image failed!", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(cloudinaryService).uploadImage(any());
        verifyNoInteractions(eventRepository);
    }

    @Test
    void testUpdateEvent_Success() throws IOException {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventScheduleRepository.findAllByEvent(event)).thenReturn(new ArrayList<>(List.of(new EventSchedule())));
        when(ticketScheduleRepository.findBySchedule(any())).thenReturn(List.of());
        when(cloudinaryService.updateImage(any(), any())).thenReturn("http://new-image.url");
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventMapper.toEventResponse(any(Event.class))).thenReturn(eventResponse);

        // When
        EventResponse response = eventService.updateEvent(1L, eventRequest, image);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getEventId());
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verify(cloudinaryService).updateImage(any(), any());
        verify(eventRepository).save(any(Event.class));
        verify(eventMapper).toEventResponse(any(Event.class));
    }

    @Test
    void testUpdateEvent_Fail_Unauthorized() {
        // Given
        User differentUser = new User();
        differentUser.setUserId("user2");
        when(authenticationService.getUserFromToken()).thenReturn(differentUser);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> eventService.updateEvent(1L, eventRequest, image));
        assertEquals("Access Denied! (unauthorized)", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verifyNoInteractions(cloudinaryService);
    }

    @Test
    void testUpdateEvent_Fail_EventPublished() {
        // Given
        event.setIsPublished(true);
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> eventService.updateEvent(1L, eventRequest, image));
        assertEquals("Event is already published!", exception.getErrorCode().getMessage());
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verifyNoInteractions(cloudinaryService);
    }

    @Test
    void testUpdateEvent_Fail_SoldTickets_LocationChanged() {
        // Given
        EventLocation location = new EventLocation();
        location.setAddress("Old Street");
        location.setCity("Old City");
        event.setEventLocation(location);
        TicketSchedule ticketSchedule = new TicketSchedule();
        ticketSchedule.setSold(1);
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventScheduleRepository.findAllByEvent(event)).thenReturn(List.of(new EventSchedule()));
        when(ticketScheduleRepository.findBySchedule(any())).thenReturn(List.of(ticketSchedule));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> eventService.updateEvent(1L, eventRequest, image));
        assertTrue(exception.getMessage().contains("Cannot update location"));
        verify(authenticationService).getUserFromToken();
        verify(eventRepository).findById(1L);
        verify(eventScheduleRepository).findAllByEvent(event);
    }
}