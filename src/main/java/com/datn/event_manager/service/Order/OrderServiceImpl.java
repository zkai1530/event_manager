package com.datn.event_manager.service.Order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.datn.event_manager.configuration.PayOSConfig;
import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.request.TicketItem;
import com.datn.event_manager.dto.response.MyTicketResponse;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderResponse1;
import com.datn.event_manager.dto.response.ticketsales.PagedOrderResponse;
import com.datn.event_manager.dto.response.ticketsales.TicketScheduleResponse;
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
import com.datn.event_manager.mapper.MyTicketMapper;
import com.datn.event_manager.mapper.OrderMapper;
import com.datn.event_manager.mapper.TicketMapper;
import com.datn.event_manager.repository.DiscountRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.TicketDiscountRepository;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.service.PayOS.PayOSService;
import com.datn.event_manager.service.Payment.PaymentService;

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
    EventScheduleRepository eventScheduleRepository;
    OrderMapper orderMapper;
    OrderRepository orderRepository;
    PayOSConfig payOSConfig;
    PayOSService payOSService;
    PaymentService paymentService;
    MyTicketMapper myTicketMapper;

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

            List<Discount> discounts = new ArrayList<>();
            if (ticketItem.getDiscountIds() != null && !ticketItem.getDiscountIds().isEmpty()) {
                if (ticketItem.getDiscountIds().size() > 2) {
                    throw new IllegalArgumentException("Maximum 2 discounts per ticket item");
                }

                for (Long discountId : ticketItem.getDiscountIds()) {
                    Discount discount = discountRepository.findById(discountId)
                            .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

                    // Kiểm tra promoCode: tối đa 1 null, 1 không null
                    long nullPromoCount = ticketItem.getDiscountIds().stream()
                            .map(id -> discountRepository.findById(id)
                                    .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND)))
                            .filter(d -> d.getPromoCode() == null)
                            .count();
                    if (nullPromoCount > 1) {
                        throw new IllegalArgumentException("Only one discount with null promoCode allowed");
                    }

                    boolean isValidDiscount = ticketDiscountRepository.existsByTicketAndDiscount(ticket, discount);
                    if (!isValidDiscount) {
                        throw new IllegalArgumentException(
                                "Discount " + discount.getName() + " is not applicable for ticket: "
                                        + ticket.getName());
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

                    discounts.add(discount);
                    usedDiscountIds.add(discountId);
                }

                // Áp dụng giảm giá tuần tự
                for (Discount discount : discounts) {
                    if (discount.getDiscountType() == DiscountType.PERCENT) {
                        BigDecimal discountAmount = ticketPrice.multiply(discount.getDiscountValue())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        ticketPrice = ticketPrice.subtract(discountAmount);
                    } else if (discount.getDiscountType() == DiscountType.FIXED) {
                        ticketPrice = ticketPrice.subtract(discount.getDiscountValue());
                    }
                }
            }

            totalPrice = totalPrice.add(ticketPrice);

            OrderTicket orderTicket = OrderTicket.builder()
                    .ticket(ticket)
                    .discount(!discounts.isEmpty() ? discounts.get(0) : null)
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
                .isCheckedIn(false)
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

        paymentService.storeUsedDiscountIds(response.getPaymentLinkId(), usedDiscountIds);

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

    @Override
    public Page<MyTicketResponse> getMyTicketsByOrderStatus(String status, String timeFilter, Pageable pageable) {
        User user = authenticationService.getUserFromToken();

        Page<Order> orders;
        if (status.equalsIgnoreCase("ALL")) {
            orders = orderRepository.findByUser(user, pageable);
        } else {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByUserAndStatus(user, orderStatus, pageable);
        }

        LocalDateTime now = LocalDateTime.now();
        boolean isUpcoming = timeFilter.equalsIgnoreCase("upcoming");
        List<Order> filteredOrders = orders.getContent().stream()
                .filter(order -> {
                    LocalDateTime eventTime = order.getSchedule().getScheduleDate()
                            .atTime(order.getSchedule().getStartTime());
                    return isUpcoming ? eventTime.isAfter(now) : eventTime.isBefore(now);
                })
                .collect(Collectors.toList());

        // Tạo Page mới từ filteredOrders
        Pageable filteredPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        int start = (int) filteredPageable.getOffset();
        int end = Math.min((start + filteredPageable.getPageSize()), filteredOrders.size());
        List<Order> pagedOrders = start < filteredOrders.size()
                ? filteredOrders.subList(start, end)
                : Collections.emptyList();

        Page<Order> filteredPage = new PageImpl<>(pagedOrders, filteredPageable, filteredOrders.size());

        return filteredPage.map(myTicketMapper::toMyTicketResponse);
    }

    @Override
    public PagedOrderResponse getSalesByScheduleId(Long scheduleId, Pageable pageable) {
        User user = authenticationService.getUserFromToken();
        EventSchedule eventSchedule = eventScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // Check if the user is the owner of the event
        if (!user.getUserId().equals(eventSchedule.getEvent().getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // get TicketSchedules
        List<Object[]> ticketScheduleResults = ticketScheduleRepository.findTicketSchedulesByScheduleId(scheduleId);
        List<TicketSchedule> ticketSchedules = ticketScheduleResults.stream()
                .map(result -> (TicketSchedule) result[0])
                .collect(Collectors.toList());

        // get Orders
        Page<Object[]> orderResults = orderRepository.findOrdersByScheduleId(scheduleId, pageable);
        List<Order> orders = orderResults.stream()
                .map(result -> (Order) result[0])
                .collect(Collectors.toList());
        
        OrderResponse1 response = new OrderResponse1();
        response.setTicketSchedules(orderMapper.toTicketScheduleResponseList(ticketSchedules));
        response.setOrders(orderMapper.toOrderDetailResponseList(orders));

        // create PagedOrderResponse
        PagedOrderResponse pagedResponse = new PagedOrderResponse();
        pagedResponse.setData(response);
        pagedResponse.setPageNumber(orderResults.getNumber());
        pagedResponse.setPageSize(orderResults.getSize());
        pagedResponse.setTotalElements(orderResults.getTotalElements());
        pagedResponse.setTotalPages(orderResults.getTotalPages());
        pagedResponse.setLast(orderResults.isLast());
        pagedResponse.setFirst(orderResults.isFirst());

        return pagedResponse;
    }

}
