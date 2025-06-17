package com.datn.event_manager.controller;

import com.datn.event_manager.dto.request.ScheduleRequest;
import com.datn.event_manager.dto.request.ScheduleItem;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.service.Schedule.ScheduleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
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

@WebMvcTest(EventScheduleController.class)
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScheduleService scheduleService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testCreateSchedules_Success() throws Exception {
        // Given
        Long eventId = 1L;
        ScheduleRequest request = new ScheduleRequest();
        ScheduleItem item = new ScheduleItem();
        item.setScheduleDate(LocalDate.now().plusDays(1));
        item.setStartTime(LocalTime.of(10, 0));
        item.setEndTime(LocalTime.of(12, 0));
        request.setSchedules(List.of(item));

        doNothing().when(scheduleService).createSchedules(eq(eventId), any(ScheduleRequest.class));

        // When & Then
        mockMvc.perform(post("/schedules/event/{eventId}", eventId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.CREATE_SCHEDULE_SUCCESS))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @WithMockUser
    void testCreateSchedules_Fail_ConflictSchedule() throws Exception {
        // Given
        Long eventId = 1L;
        ScheduleRequest request = new ScheduleRequest();
        ScheduleItem item = new ScheduleItem();
        item.setScheduleDate(LocalDate.now().plusDays(1));
        item.setStartTime(LocalTime.of(10, 0));
        item.setEndTime(LocalTime.of(12, 0));
        request.setSchedules(List.of(item));

        doThrow(new AppException(ErrorCode.CONFLICT_SCHEDULE))
                .when(scheduleService).createSchedules(eq(eventId), any(ScheduleRequest.class));

        // When & Then
        mockMvc.perform(post("/schedules/event/{eventId}", eventId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Schedule conflict detected!"));
    }

    @Test
    @WithMockUser
    void testUpdateSchedule_Success() throws Exception {
        // Given
        Long scheduleId = 1L;
        ScheduleItem request = new ScheduleItem();
        request.setScheduleDate(LocalDate.now().plusDays(2));
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(16, 0));

        doNothing().when(scheduleService).updateSchedule(eq(scheduleId), any(ScheduleItem.class));

        // When & Then
        mockMvc.perform(put("/schedules/{scheduleId}", scheduleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.UPDATE_SCHEDULE_SUCCESS))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @WithMockUser
    void testUpdateSchedule_Fail_ScheduleNotFound() throws Exception {
        // Given
        Long scheduleId = 1L;
        ScheduleItem request = new ScheduleItem();
        request.setScheduleDate(LocalDate.now().plusDays(2));
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(16, 0));

        doThrow(new AppException(ErrorCode.SCHEDULE_NOT_FOUND))
                .when(scheduleService).updateSchedule(eq(scheduleId), any(ScheduleItem.class));

        // When & Then
        mockMvc.perform(put("/schedules/{scheduleId}", scheduleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Schedule not found!"));
    }
}