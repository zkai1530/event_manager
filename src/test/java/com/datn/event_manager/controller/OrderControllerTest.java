package com.datn.event_manager.controller;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.request.TicketItem;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.OrderReservationResponse;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.OrderStatusResponse;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.service.Order.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

@WebMvcTest(OrderController.class)
public class OrderControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void testReserveOrder_Success() throws Exception {
        // Given
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setScheduleId(1L);
        TicketItem ticketItem = new TicketItem();
        ticketItem.setTicketId(1L);
        ticketItem.setQuantity(2);
        ticketItem.setDiscountIds(List.of(1L));
        orderRequest.setTickets(List.of(ticketItem));

        OrderReservationResponse reservationResponse = new OrderReservationResponse(1L, LocalDateTime.now());
        APIResponse response = new APIResponse("Create order success", reservationResponse);
        when(orderService.reserveOrder(orderRequest)).thenReturn(reservationResponse);

        // When & Then
        mockMvc.perform(post("/order/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Create order was successfully!"))
                .andExpect(jsonPath("$.data.orderId").value(1L));
    }

    @Test
    @WithMockUser
    void testReserveOrder_Fail_WrongScheduleId() throws Exception {
        // Given
        OrderRequest request = new OrderRequest();
        request.setScheduleId(-1L); // ScheduleId không hợp lệ
        TicketItem item = new TicketItem();
        item.setTicketId(1L);
        item.setQuantity(2);
        item.setDiscountIds(List.of(1L));
        request.setTickets(List.of(item));

        when(orderService.reserveOrder(argThat(req -> req.getScheduleId() < 0)))
                .thenThrow(new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // When & Then
        mockMvc.perform(post("/order/reserve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Schedule not found!"));
    }

    @Test
    @WithMockUser
    void testGetOrderStatus_Success() throws Exception {
        // Given
        Long orderId = 1L;
        OrderStatusResponse statusResponse = OrderStatusResponse.builder()
                .orderId(orderId)
                .status(OrderStatus.PENDING)
                .remainingTimeSeconds(900L)
                .build();
        APIResponse response = new APIResponse("Create order success", statusResponse);
        when(orderService.getOrderStatus(orderId)).thenReturn(statusResponse);

        // When & Then
        mockMvc.perform(get("/order/status/{orderId}", orderId)
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Create order was successfully!"))
                .andExpect(jsonPath("$.data.orderId").value(1L))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.remainingTimeSeconds").value(900));
    }

    @Test
    @WithMockUser
    void testCancelOrder_Success() throws Exception {
        // Given
        Long orderId = 1L;
        APIResponse response = new APIResponse("Update order status success", null);
        doNothing().when(orderService).cancelOrder(orderId);

        // When & Then
        mockMvc.perform(put("/order/cancel/{orderId}", orderId)
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Order status updated successfully!"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @WithMockUser
    void testCreatePaymentLink_Success() throws Exception {
        // Given
        Long orderId = 1L;
        String checkoutUrl = "https://payos.vn/checkout/123";
        APIResponse response = new APIResponse("Create order success", checkoutUrl);
        when(orderService.createPaymentLink(orderId)).thenReturn(checkoutUrl);

        // When & Then
        mockMvc.perform(post("/order/payment-link/{orderId}", orderId)
                .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Create order was successfully!"))
                .andExpect(jsonPath("$.data").value(checkoutUrl));
    }
}
