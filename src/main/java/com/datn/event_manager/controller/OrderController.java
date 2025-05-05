package com.datn.event_manager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderResponse1;
import com.datn.event_manager.service.Order.OrderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @NonFinal
    @Value("${myticket-per-page}")
    int MYTICKET_PER_PAGE;

    @NonFinal
    @Value("${recent-order-per-page}")
    int RECENT_ORDER;

    @PostMapping("/create-order")
    public ResponseEntity<APIResponse> createOrder(@RequestBody OrderRequest orderRequest) throws Exception {
        // return checkoutUrl
        return ResponseEntity.ok(new APIResponse(Message.CREATE_ORDER_SUCCESS, orderService.createOrder(orderRequest)));
    }

    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<APIResponse> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok(new APIResponse(Message.UPDATE_ORDER_STATUS_SUCCESS, null));
    }

    @PostMapping("/check-in")
    public ResponseEntity<APIResponse> checkIn(@RequestBody CheckInRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.CHECK_IN_SUCCESS, orderService.checkIn(request)));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<APIResponse> getMyTickets(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "upcoming") String timeFilter,
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, MYTICKET_PER_PAGE);
        return ResponseEntity.ok(new APIResponse(Message.GET_MYTICKET_SUCCESS,
                orderService.getMyTicketsByOrderStatus(status, timeFilter, pageable)));
    }

    @GetMapping("/by-schedule/{scheduleId}")
    public ResponseEntity<APIResponse> getSalesByScheduleId(@PathVariable Long scheduleId,
            @RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, RECENT_ORDER);
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND,
                orderService.getSalesByScheduleId(scheduleId, pageable)));
    }
}
