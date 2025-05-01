package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.service.Payment.PaymentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/webhook/payos")
    public ResponseEntity<APIResponse> handlePayOSWebhook(@RequestBody String webhookBody) throws Exception {
        paymentService.handlePayOSWebhook(webhookBody);
        return ResponseEntity.ok(new APIResponse("Webhook handle succesfully!", null));
    }
}
