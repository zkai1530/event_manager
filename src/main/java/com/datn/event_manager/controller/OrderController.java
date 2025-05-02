package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.service.Order.OrderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

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
        return ResponseEntity.ok(new APIResponse(Message.UPDATE_ORDER_STATUS_SUCCESS, orderService.checkIn(request)));
    }
}
