package com.datn.event_manager.controller;

import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.service.Ticket.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testCreateTicket_Success() throws Exception {
        // Given
        TicketRequest request = new TicketRequest();
        request.setName("VIP Ticket");
        request.setDescription("VIP access");
        request.setPrice(new BigDecimal("100.00"));
        request.setAvailableQuantity(50);
        request.setSaleStart(LocalDateTime.now().plusDays(1));
        request.setSaleEnd(LocalDateTime.now().plusDays(2));
        request.setScheduleIds(List.of(1L));

        doNothing().when(ticketService).createTicket(any(TicketRequest.class));

        // When & Then
        mockMvc.perform(post("/ticket")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.CREATE_TICKET_SUCCESS))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @WithMockUser
    void testCreateTicket_Fail_InvalidSchedule() throws Exception {
        // Given
        TicketRequest request = new TicketRequest();
        request.setName("VIP Ticket");
        request.setScheduleIds(List.of(-1L));

        doThrow(new IllegalArgumentException("One or many schedules invalid!"))
                .when(ticketService).createTicket(any(TicketRequest.class));

        // When & Then
        mockMvc.perform(post("/ticket")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Internal Server Error"));
    }

    @Test
    @WithMockUser
    void testUpdateTicket_Success() throws Exception {
        // Given
        Long ticketId = 1L;
        TicketRequest request = new TicketRequest();
        request.setName("Updated Ticket");
        request.setPrice(new BigDecimal("150.00"));
        request.setAvailableQuantity(100);
        request.setScheduleIds(List.of(1L));

        doNothing().when(ticketService).updateTicket(eq(ticketId), any(TicketRequest.class));

        // When & Then
        mockMvc.perform(put("/ticket/{ticketId}", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(Message.UPDATE_TICKET_SUCCESS))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @WithMockUser
    void testUpdateTicket_Fail_TicketNotFound() throws Exception {
        // Given
        Long ticketId = 1L;
        TicketRequest request = new TicketRequest();
        request.setName("Updated Ticket");

        doThrow(new AppException(ErrorCode.TICKET_NOT_FOUND))
                .when(ticketService).updateTicket(eq(ticketId), any(TicketRequest.class));

        // When & Then
        mockMvc.perform(put("/ticket/{ticketId}", ticketId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found!"));
    }
}