package com.datn.event_manager.service.Order;

import com.datn.event_manager.dto.request.OrderRequest;

public interface OrderService {
    String createOrder(OrderRequest orderRequest) throws Exception;

    void cancelOrder(Long orderId);
}
