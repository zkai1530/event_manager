package com.datn.event_manager.controller;

import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.request.EventLocationRequest;
import com.datn.event_manager.dto.request.FAQRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.service.Event.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testCreateEvent_Success() throws Exception {
        // Given
        EventRequest request = new EventRequest();
        request.setName("Test Event");
        request.setSummary("Summary");
        request.setDescription("Description");
        request.setCapacity(100);
        request.setEventType(EventType.SINGLE);
        request.setEventDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(12, 0));
        request.setEventLocationRequest(new EventLocationRequest("Hanoi", "123 Street", "10000", "Vietnam"));
        request.setFaqs(List.of(new FAQRequest(null, "Question?", "Answer")));

        MockMultipartFile requestPart = new MockMultipartFile("eventRequest", "",
                MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(request).getBytes());
        MockMultipartFile imagePart = new MockMultipartFile("image", "test.jpg",
                MediaType.IMAGE_JPEG_VALUE, "image content".getBytes());

        when(eventService.createEvent(any(EventRequest.class), any())).thenReturn("1");

        // When & Then
        mockMvc.perform(multipart("/event")
                .file(requestPart)
                .file(imagePart)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.CREATE_EVENT_SUCCESS))
                .andExpect(jsonPath("$.data").value("1"));
    }

    @Test
    @WithMockUser
    void testCreateEvent_Fail_InvalidDateTime() throws Exception {
        // Given
        EventRequest request = new EventRequest();
        request.setName("Test Event");
        request.setEventType(EventType.SINGLE);
        request.setEventDate(null); // Invalid: null date

        MockMultipartFile requestPart = new MockMultipartFile("eventRequest", "",
                MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(request).getBytes());
        MockMultipartFile imagePart = new MockMultipartFile("image", "test.jpg",
                MediaType.IMAGE_JPEG_VALUE, "image content".getBytes());

        when(eventService.createEvent(any(EventRequest.class), any()))
                .thenThrow(new AppException(ErrorCode.DATE_TIME_IS_NULL));

        // When & Then
        mockMvc.perform(multipart("/event")
                .file(requestPart)
                .file(imagePart)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Datetime is null!"));
    }

    @Test
    @WithMockUser
    void testUpdateEvent_Success() throws Exception {
        // Given
        Long eventId = 1L;
        EventRequest request = new EventRequest();
        request.setName("Updated Event");
        request.setCapacity(200);
        request.setEventType(EventType.SINGLE);
        request.setEventDate(LocalDate.now().plusDays(2));
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(16, 0));

        EventResponse response = new EventResponse();
        response.setEventId(eventId);
        response.setName("Updated Event");

        MockMultipartFile requestPart = new MockMultipartFile("eventRequest", "",
                MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(request).getBytes());
        MockMultipartFile imagePart = new MockMultipartFile("image", "updated.jpg",
                MediaType.IMAGE_JPEG_VALUE, "updated image".getBytes());

        when(eventService.updateEvent(eq(eventId), any(EventRequest.class), any())).thenReturn(response);

        // When & Then
        mockMvc.perform(multipart("/event/{eventId}", eventId)
                .file(requestPart)
                .file(imagePart)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(request1 -> {
                    request1.setMethod("PUT");
                    return request1;
                })
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.UPDATE_EVENT_SUCCESS))
                .andExpect(jsonPath("$.data.eventId").value(eventId));

    }

    @Test
    @WithMockUser
    void testUpdateEvent_Fail_Unauthorized() throws Exception {
        // Given
        Long eventId = 1L;
        EventRequest request = new EventRequest();
        request.setName("Updated Event");

        MockMultipartFile requestPart = new MockMultipartFile("eventRequest", "",
                MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsString(request).getBytes());
        MockMultipartFile imagePart = new MockMultipartFile("image", "updated.jpg",
                MediaType.IMAGE_JPEG_VALUE, "updated image".getBytes());

        when(eventService.updateEvent(eq(eventId), any(EventRequest.class), any()))
                .thenThrow(new AppException(ErrorCode.UNAUTHORIZED));

        // When & Then
        mockMvc.perform(multipart("/event/{eventId}", eventId)
                .file(requestPart)
                .file(imagePart)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(mockRequest -> {
                    mockRequest.setMethod("PUT");
                    return mockRequest;
                })
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access Denied! (unauthorized)"));

    }
}