package com.datn.event_manager.service.Payment;

import java.util.Set;

import com.datn.event_manager.entity.Order;

public interface PaymentService {
    public void handlePayOSWebhook (String webhookBody) throws Exception;

    void storeUsedDiscountIds(String paymentLinkId, Set<Long> usedDiscountIds);
    Set<Long> getUsedDiscountIds(String paymentLinkId);
}
