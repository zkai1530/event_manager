package com.datn.event_manager.service.Payment;

import com.datn.event_manager.entity.Order;

public interface PaymentService {
    public void handlePayOSWebhook (String webhookBody) throws Exception;
}
