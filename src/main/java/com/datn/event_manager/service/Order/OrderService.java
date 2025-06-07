package com.datn.event_manager.service.Order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.response.MyTicketResponse;
import com.datn.event_manager.dto.response.OrderReservationResponse;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.OrderStatusResponse;
import com.datn.event_manager.dto.response.SuccessOrderResponse;
import com.datn.event_manager.dto.response.ticketsales.PagedOrderResponse;

public interface OrderService {
    String createOrder(OrderRequest orderRequest) throws Exception;

    OrderReservationResponse reserveOrder(OrderRequest orderRequest) throws Exception;

    String createPaymentLink(Long orderId) throws Exception;

    OrderStatusResponse getOrderStatus(Long orderId);

    void cancelOrder(Long orderId);

    OrderResponse checkIn(CheckInRequest request);

    Page<MyTicketResponse> getMyTicketsByOrderStatus(String status, String timeFilter, Pageable pageable);

    PagedOrderResponse getSalesByScheduleId(Long scheduleId, Pageable pageable);

    SuccessOrderResponse getSuccessOrderDetails(Long orderId);
}
