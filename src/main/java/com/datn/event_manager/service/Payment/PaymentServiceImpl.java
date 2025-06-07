package com.datn.event_manager.service.Payment;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

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

    Map<String, Set<Long>> usedDiscountIdsMap = new ConcurrentHashMap<>();

    // Hàm lưu usedDiscountIds
    @Override
    public void storeUsedDiscountIds(String paymentLinkId, Set<Long> usedDiscountIds) {
        usedDiscountIdsMap.put(paymentLinkId, usedDiscountIds);
    }

    // Hàm lấy usedDiscountIds
    @Override
    public Set<Long> getUsedDiscountIds(String paymentLinkId) {
        return usedDiscountIdsMap.getOrDefault(paymentLinkId, new HashSet<>());
    }

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

        // todo: update ticketscheudle's sold and reset reservedQuantity
        Set<Long> usedDiscountIds = new HashSet<>();
        for (OrderTicket orderTicket : order.getOrderTickets()) {
            Ticket ticket = orderTicket.getTicket();
            TicketSchedule ticketSchedule = ticket.getTicketSchedules().stream()
                    .filter(ts -> ts.getSchedule().getScheduleId().equals(order.getSchedule().getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            // * update ticketscheudle's sold
            int newSold = ticketSchedule.getSold() + orderTicket.getQuantity();
            ticketSchedule.setSold(newSold);

            // * reset reservedQuantity
            int newReserved = ticketSchedule.getReservedQuantity() - orderTicket.getQuantity();
            ticketSchedule.setReservedQuantity(Math.max(newReserved, 0));

            ticketScheduleRepository.save(ticketSchedule);

            if (orderTicket.getDiscount() != null) {
                usedDiscountIds.add(orderTicket.getDiscount().getDiscountId());
            }
        }

        // todo: update used discount
        Set<Long> usedDiscountIds1 = getUsedDiscountIds(paymentLinkId); // Lấy từ cache
        for (Long discountId : usedDiscountIds1) {
            Discount discount = discountRepository.findById(discountId)
                    .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

            int totalQuantity = order.getOrderTickets().stream()
                    .mapToInt(OrderTicket::getQuantity)
                    .sum();
            discount.setTimesUsed(discount.getTimesUsed() + totalQuantity);
            discountRepository.save(discount);
        }

        // Xóa cache sau khi xử lý
        usedDiscountIdsMap.remove(paymentLinkId);

        orderRepository.save(order);
    }

}
