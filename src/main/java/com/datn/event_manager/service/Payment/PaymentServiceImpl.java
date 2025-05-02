package com.datn.event_manager.service.Payment;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.entity.Order.PaymentStatus;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.repository.DiscountRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.PayOS.PayOSService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    PayOSService payOSService;
    OrderRepository orderRepository;
    TicketRepository ticketRepository;
    TicketScheduleRepository ticketScheduleRepository;
    DiscountRepository discountRepository;

    @Override
    @Transactional
    public void handlePayOSWebhook(String webhookBody) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();

        PayOS payOS = payOSService.getPayOSClient();

        Webhook webhook = objectMapper.readValue(webhookBody, Webhook.class);

        WebhookData webhookData = payOS.verifyPaymentWebhookData(webhook);

        // check if it's first time confirm webhook URL to payOS
        if (webhookData.getDescription().equals("VQRIO123")
                && webhookData.getAccountNumber().equals("12345678")) {
            log.info("Confirm webhook URL from PayOS!");
            return;
        }
        log.info("Webhook Data: {}", objectMapper.writeValueAsString(webhookData));
        String paymentLinkId = webhookData.getPaymentLinkId();
        String status = webhookData.getCode();
        log.info("Status: {}", status);

        // Update order
        Order order = orderRepository.findByPaymentLinkId(paymentLinkId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // todo: update order status
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setStatus(OrderStatus.PAID);

        // todo: create code for qrcode
        String qrCode = UUID.randomUUID().toString();
        order.setQrCode(qrCode);

        // todo: update ticketscheudle's sold
        Set<Long> usedDiscountIds = new HashSet<>();
        for (OrderTicket orderTicket : order.getOrderTickets()) {
            Ticket ticket = orderTicket.getTicket();
            TicketSchedule ticketSchedule = ticket.getTicketSchedules().stream()
                    .filter(ts -> ts.getSchedule().getScheduleId().equals(order.getSchedule().getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            int newSold = ticketSchedule.getSold() + orderTicket.getQuantity();
            ticketSchedule.setSold(newSold);
            ticketScheduleRepository.save(ticketSchedule);

            if (orderTicket.getDiscount() != null) {
                usedDiscountIds.add(orderTicket.getDiscount().getDiscountId());
            }
        }

        // todo: update used discount
        for (Long discountId : usedDiscountIds) {
            Discount discount = discountRepository.findById(discountId)
                    .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

            discount.setTimesUsed(discount.getTimesUsed() + 1);
            discountRepository.save(discount);
        }

        // switch (status) {
        // case "00":
        // order.setPaymentStatus(PaymentStatus.SUCCESS);
        // order.setStatus(OrderStatus.PAID);
        // Set<Long> usedDiscountIds = new HashSet<>();
        // for (OrderTicket orderTicket : order.getOrderTickets()) {
        // Ticket ticket = orderTicket.getTicket();
        // int newSold = ticket.getSold() + orderTicket.getQuantity();
        // ticket.setSold(newSold);
        // ticketRepository.save(ticket);

        // if (orderTicket.getDiscount() != null) {
        // usedDiscountIds.add(orderTicket.getDiscount().getDiscountId());
        // }
        // }

        // for (Long discountId : usedDiscountIds) {
        // Discount discount = discountRepository.findById(discountId)
        // .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        // discount.setTimesUsed(discount.getTimesUsed() + 1);
        // discountRepository.save(discount);
        // }
        // break;
        // case "CANCELED":
        // order.setPaymentStatus(PaymentStatus.FAILED);
        // order.setStatus(OrderStatus.CANCELED);
        // break;

        // default:
        // return;
        // }

        orderRepository.save(order);
    }

}
