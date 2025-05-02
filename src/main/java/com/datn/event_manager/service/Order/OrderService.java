package com.datn.event_manager.service.Order;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.response.OrderResponse;

public interface OrderService {
    String createOrder(OrderRequest orderRequest) throws Exception;

    void cancelOrder(Long orderId);

    OrderResponse checkIn(CheckInRequest request);
}
