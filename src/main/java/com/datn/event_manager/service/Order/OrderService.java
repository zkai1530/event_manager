package com.datn.event_manager.service.Order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.response.MyTicketResponse;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderResponse1;
import com.datn.event_manager.dto.response.ticketsales.PagedOrderResponse;

public interface OrderService {
    String createOrder(OrderRequest orderRequest) throws Exception;

    void cancelOrder(Long orderId);

    OrderResponse checkIn(CheckInRequest request);

    Page<MyTicketResponse> getMyTicketsByOrderStatus(String status, String timeFilter, Pageable pageable);

    PagedOrderResponse getSalesByScheduleId(Long scheduleId, Pageable pageable);
}
