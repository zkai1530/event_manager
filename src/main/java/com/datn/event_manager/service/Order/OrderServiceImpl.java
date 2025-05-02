package com.datn.event_manager.service.Order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.event_manager.configuration.PayOSConfig;
import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.request.TicketItem;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.entity.Order.PaymentStatus;
import com.datn.event_manager.enums.DiscountType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.OrderMapper;
import com.datn.event_manager.repository.DiscountRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.TicketDiscountRepository;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.service.PayOS.PayOSService;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
    AuthenticationService authenticationService;
    EventScheduleRepository scheduleRepository;
    TicketRepository ticketRepository;
    DiscountRepository discountRepository;
    TicketDiscountRepository ticketDiscountRepository;
    TicketScheduleRepository ticketScheduleRepository;
    OrderMapper orderMapper;
    OrderRepository orderRepository;
    PayOSConfig payOSConfig;
    PayOSService payOSService;

    @Override
    @Transactional
    public String createOrder(OrderRequest orderRequest) throws Exception {
        User user = authenticationService.getUserFromToken();

        EventSchedule eventSchedule = scheduleRepository.findById(orderRequest.getScheduleId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderTicket> orderTickets = new ArrayList<>();
        Set<Long> usedDiscountIds = new HashSet<>();

        for (TicketItem ticketItem : orderRequest.getTickets()) {
            Ticket ticket = ticketRepository.findById(ticketItem.getTicketId())
                    .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

            TicketSchedule ticketSchedule = ticket.getTicketSchedules().stream()
                    .filter(ts -> ts.getSchedule().getScheduleId().equals(eventSchedule.getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            if (ticketItem.getQuantity() > ticketSchedule.getAvailableQuantity() - ticketSchedule.getSold()) {
                throw new AppException(ErrorCode.TICKET_QUANTITY_EXCEEDS_AVAILABLE);
            }
            // if (ticketItem.getQuantity() > ticket.getAvailableQuantity() -
            // ticket.getSold()) {
            // throw new AppException(ErrorCode.TICKET_QUANTITY_EXCEEDS_AVAILABLE);
            // }

            BigDecimal ticketPrice = ticket.getPrice().multiply(BigDecimal.valueOf(ticketItem.getQuantity()));

            Discount discount = null;
            if (ticketItem.getDiscountId() != null) {
                discount = discountRepository.findById(ticketItem.getDiscountId())
                        .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

                boolean isValidDiscount = ticketDiscountRepository
                        .existsByTicketAndDiscount(ticket, discount);

                if (!isValidDiscount) {
                    throw new IllegalArgumentException(
                            "Discount " + discount.getName() + " is not applicable for ticket: " + ticket.getName());
                }

                LocalDateTime now = LocalDateTime.now();
                if (discount.getDiscountStart() != null && now.isBefore(discount.getDiscountStart())) {
                    throw new IllegalArgumentException("Discount is not yet valid: " + discount.getName());
                }
                if (discount.getDiscountEnd() != null && now.isAfter(discount.getDiscountEnd())) {
                    throw new AppException(ErrorCode.DISCOUNT_EXPIRED);
                }

                if (discount.getMaxUses() != null && discount.getTimesUsed() >= discount.getMaxUses()) {
                    throw new AppException(ErrorCode.DISCOUNT_USAGE_LIMIT_REACHED);
                }

                if (discount.getDiscountType() == DiscountType.PERCENT) {
                    log.info("discount: " + discount.getDiscountValue());
                    BigDecimal discountAmount = ticketPrice.multiply(discount.getDiscountValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    ticketPrice = ticketPrice.subtract(discountAmount);

                } else if (discount.getDiscountType() == DiscountType.FIXED) {
                    ticketPrice = ticketPrice.subtract(discount.getDiscountValue());
                }

                usedDiscountIds.add(discount.getDiscountId());
            }

            totalPrice = totalPrice.add(ticketPrice);

            OrderTicket orderTicket = OrderTicket.builder()
                    .ticket(ticket)
                    .discount(discount)
                    .priceAtPurchase(ticket.getPrice().doubleValue())
                    .quantity(ticketItem.getQuantity())
                    .build();

            orderTickets.add(orderTicket);
        }

        Order order = Order.builder()
                .user(user)
                .schedule(eventSchedule)
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .orderTickets(orderTickets)
                .createdAt(LocalDateTime.now())
                .build();

        orderTickets.forEach(ot -> ot.setOrder(order));

        orderRepository.save(order);

        if (order.getOrderId() > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("orderId exceeds Integer.MAX_VALUE");
        }

        // Tạo PaymentData và gọi PayOS
        List<ItemData> items = orderTickets.stream()
                .map(ot -> ItemData.builder()
                        .name(ot.getTicket().getName())
                        .quantity(ot.getQuantity())
                        .price(ot.getTicket().getPrice().intValue())
                        .build())
                .collect(Collectors.toList());

        PaymentData paymentData = PaymentData.builder()
                .orderCode(order.getOrderId())
                .amount(totalPrice.intValue())
                .description("Payment for order " + order.getOrderId())
                .items(items)
                .returnUrl(payOSConfig.getReturnUrl())
                .cancelUrl(payOSConfig.getCancelUrl())
                .build();

        PayOS payOS = payOSService.getPayOSClient();
        CheckoutResponseData response = payOS.createPaymentLink(paymentData);

        order.setPaymentLinkId(response.getPaymentLinkId());
        orderRepository.save(order);

        return response.getCheckoutUrl();
    }

    @Override
    public void cancelOrder(Long orderId) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!user.getUserId().equals(order.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (PaymentStatus.PENDING.equals(order.getPaymentStatus()) && OrderStatus.PENDING.equals(order.getStatus())) {
            order.setStatus(OrderStatus.CANCELED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
        }
    }

    @Override
    public OrderResponse checkIn(CheckInRequest request) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findByQrCode(request.getQrCode())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // // check if user is the owner of the event
        if (!order.getSchedule().getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getIsCheckedIn()) {   
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        order.setIsCheckedIn(true);

        // update each checkedInCount for TicketSchedule
        EventSchedule schedule = order.getSchedule();
        for (OrderTicket orderTicket : order.getOrderTickets()) {
            TicketSchedule ticketSchedule = orderTicket.getTicket().getTicketSchedules().stream()
                    .filter(ts -> ts.getSchedule().getScheduleId().equals(schedule.getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            ticketSchedule.setCheckedInCount(ticketSchedule.getCheckedInCount() + orderTicket.getQuantity());
            ticketScheduleRepository.save(ticketSchedule);
        }

        orderRepository.save(order);
        return orderMapper.toOrderResponse(order);
    }

}
