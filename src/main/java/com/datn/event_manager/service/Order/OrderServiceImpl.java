package com.datn.event_manager.service.Order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.datn.event_manager.configuration.PayOSConfig;
import com.datn.event_manager.controller.UserController;
import com.datn.event_manager.dto.request.CheckInRequest;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.request.TicketItem;
import com.datn.event_manager.dto.response.MyTicketResponse;
import com.datn.event_manager.dto.response.OrderReservationResponse;
import com.datn.event_manager.dto.response.OrderResponse;
import com.datn.event_manager.dto.response.OrderStatusResponse;
import com.datn.event_manager.dto.response.SuccessOrderResponse;
import com.datn.event_manager.dto.response.ticketsales.OrderResponse1;
import com.datn.event_manager.dto.response.ticketsales.PagedOrderResponse;
import com.datn.event_manager.dto.response.ticketsales.TicketScheduleResponse;
import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.OrderTicketSeat;
import com.datn.event_manager.entity.Seat;
import com.datn.event_manager.entity.Seat.SeatStatus;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.entity.Order.PaymentStatus;
import com.datn.event_manager.enums.DiscountType;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.MyTicketMapper;
import com.datn.event_manager.mapper.OrderMapper;
import com.datn.event_manager.mapper.TicketMapper;
import com.datn.event_manager.repository.ComplaintRepository;
import com.datn.event_manager.repository.DiscountRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.OrderTicketSeatRepository;
import com.datn.event_manager.repository.SeatRepository;
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

    private final UserController userController;
    AuthenticationService authenticationService;
    EventScheduleRepository scheduleRepository;
    TicketRepository ticketRepository;
    DiscountRepository discountRepository;
    TicketDiscountRepository ticketDiscountRepository;
    TicketScheduleRepository ticketScheduleRepository;
    EventScheduleRepository eventScheduleRepository;
    ComplaintRepository complaintRepository;
    SeatRepository seatRepository;
    OrderTicketSeatRepository orderTicketSeatRepository;
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

            if (ticket.getSaleEnd().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }

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
                    .priceAtPurchase(totalPrice.doubleValue())
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

        OrderStatus orderStatus = null;
        if (!"ALL".equalsIgnoreCase(status)) {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        }

        boolean isUpcoming = "upcoming".equalsIgnoreCase(timeFilter);
        LocalDateTime now = LocalDateTime.now();

        Page<Order> ordersPage = orderRepository.findOrdersByUserStatusAndTimeFilter(
                user.getUserId(),
                orderStatus != null ? orderStatus.name() : null,
                isUpcoming,
                now,
                pageable);

        return ordersPage.map(order -> {
            MyTicketResponse response = myTicketMapper.toMyTicketResponse(order);
            response.setComplaint(complaintRepository.existsByOrder(order));
            return response;
        });
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
        Page<Order> orderResults = orderRepository.findOrdersByScheduleId(scheduleId, pageable);
        List<Order> orders = orderResults.getContent();

        OrderResponse1 response = new OrderResponse1();
        response.setTicketSchedules(orderMapper.toTicketScheduleResponseList(ticketSchedules));
        response.setOrders(orderMapper.toOrderDetailResponseList(orders));

        // calculate total revenue and check in count by schedule
        BigDecimal totalRevenue = orderRepository.getTotalPaidAmountBySchedule(eventSchedule);
        Long totalCheckedIn = ticketScheduleRepository.countCheckedInByScheduleId(scheduleId);

        // create PagedOrderResponse
        PagedOrderResponse pagedResponse = new PagedOrderResponse();
        pagedResponse.setData(response);
        pagedResponse.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        pagedResponse.setTotalCheckedIn(totalCheckedIn != null ? totalCheckedIn : 0L);
        pagedResponse.setPageNumber(orderResults.getNumber());
        pagedResponse.setPageSize(orderResults.getSize());
        pagedResponse.setTotalElements(orderResults.getTotalElements());
        pagedResponse.setTotalPages(orderResults.getTotalPages());
        pagedResponse.setLast(orderResults.isLast());
        pagedResponse.setFirst(orderResults.isFirst());

        return pagedResponse;
    }

    @Override
    public SuccessOrderResponse getSuccessOrderDetails(Long orderId) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findOrderByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Check if the user is the owner of the order
        if (!user.getUserId().equals(order.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.toSuccessOrderResponse(order);
    }

    @Override
    public SuccessOrderResponse getOrderByOrderId(Long orderId) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findOrderByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Check if the user is the owner of the order
        if (!user.getUserId().equals(order.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.toSuccessOrderResponse(order);
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public OrderReservationResponse reserveOrder(OrderRequest orderRequest) throws Exception {
        User user = authenticationService.getUserFromToken();

        EventSchedule eventSchedule = scheduleRepository.findById(orderRequest.getScheduleId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        Event event = eventSchedule.getEvent();
        boolean hasSeatMap = event.getHasSeatMap() != null && event.getHasSeatMap()
                && event.getEventType() == EventType.SINGLE;

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderTicket> orderTickets = new ArrayList<>();
        Set<Long> usedDiscountIds = new HashSet<>();
        List<Pair<TicketSchedule, Integer>> schedulesToReserve = new ArrayList<>();
        Map<Long, OrderTicket> ticketIdToOrderTicket = new HashMap<>();
        List<OrderTicketSeat> orderTicketSeats = new ArrayList<>();

        for (TicketItem ticketItem : orderRequest.getTickets()) {
            Ticket ticket = ticketRepository.findById(ticketItem.getTicketId())
                    .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

            if (ticket.getSaleEnd().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }

            TicketSchedule ticketSchedule = ticket.getTicketSchedules().stream()
                    .filter(ts -> ts.getSchedule().getScheduleId().equals(eventSchedule.getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

            int quantity;
            List<Long> seatIds = ticketItem.getSeatIds();

            // Xử lý trường hợp có seat
            if (hasSeatMap && seatIds != null && !seatIds.isEmpty()) {
                if (ticketItem.getQuantity() == null) {
                    throw new IllegalArgumentException("Quantity is required even for events with seat map");
                }
                quantity = ticketItem.getQuantity();

                if (seatIds.size() != quantity) {
                    throw new IllegalArgumentException("Quantity must match the number of seatIds");
                }

                // Kiểm tra ghế
                log.info("Fetching seats for seatIds: {}", seatIds);
                List<Seat> seats = seatRepository.findAllById(seatIds);
                if (seats.size() != seatIds.size()) {
                    throw new AppException(ErrorCode.SEAT_NOT_FOUND);
                }

                for (Seat seat : seats) {
                    if (seat.getStatus() != SeatStatus.AVAILABLE) {
                        throw new AppException(ErrorCode.SEAT_NOT_AVAILABLE);
                    }
                    if (!seat.getSection().getTicket().getTicketId().equals(ticket.getTicketId())) {
                        throw new IllegalArgumentException("Seat does not belong to the specified ticket");
                    }
                }

                // Đặt trước ghế
                log.info("Reserving seats: {}", seatIds);
                for (Seat seat : seats) {
                    seat.setStatus(SeatStatus.RESERVED);
                }
                seatRepository.saveAll(seats);
                log.info("Seats reserved successfully");
            } else {
                if (ticketItem.getQuantity() == null || ticketItem.getQuantity() <= 0) {
                    throw new IllegalArgumentException("Quantity must be provided for events without seat map");
                }
                quantity = ticketItem.getQuantity();

                if (quantity > ticketSchedule.getAvailableQuantity() - ticketSchedule.getSold()
                        - ticketSchedule.getReservedQuantity()) {
                    throw new AppException(ErrorCode.TICKET_QUANTITY_EXCEEDS_AVAILABLE);
                }
            }

            schedulesToReserve.add(Pair.of(ticketSchedule, quantity));

            BigDecimal ticketPrice = ticket.getPrice();

            List<Discount> discounts = new ArrayList<>();
            if (ticketItem.getDiscountIds() != null && !ticketItem.getDiscountIds().isEmpty()) {
                if (ticketItem.getDiscountIds().size() > 2) {
                    throw new IllegalArgumentException("Maximum 2 discounts per ticket item");
                }

                for (Long discountId : ticketItem.getDiscountIds()) {
                    Discount discount = discountRepository.findById(discountId)
                            .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

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
                        throw new IllegalArgumentException("Discount " + discount.getName()
                                + " is not applicable for ticket: " + ticket.getName());
                    }

                    LocalDateTime now = LocalDateTime.now();
                    log.info("Current time: {}", now);
                    log.info("Discount start time: {}", discount.getDiscountStart());
                    if (discount.getDiscountStart() != null && now.isBefore(discount.getDiscountStart())) {
                        throw new IllegalArgumentException("Discount is not yet valid");
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

            totalPrice = totalPrice.add(ticketPrice.multiply(BigDecimal.valueOf(quantity)));

            OrderTicket orderTicket = OrderTicket.builder()
                    .ticket(ticket)
                    .discount(!discounts.isEmpty() ? discounts.get(0) : null)
                    .priceAtPurchase(ticketPrice.doubleValue())
                    .quantity(quantity)
                    .build();

            // Lưu OrderTicket vào map
            ticketIdToOrderTicket.put(ticket.getTicketId(), orderTicket);

            // Liên kết ghế với OrderTicket nếu có seatIds
            if (hasSeatMap && seatIds != null && !seatIds.isEmpty()) {
                for (Long seatId : seatIds) {
                    OrderTicketSeat orderTicketSeat = OrderTicketSeat.builder()
                            .orderTicket(orderTicket)
                            .seat(seatRepository.getReferenceById(seatId))
                            .createdAt(LocalDateTime.now())
                            .build();
                    orderTicketSeats.add(orderTicketSeat);
                }
                orderTicket.setOrderTicketSeats(new ArrayList<>(orderTicketSeats));
            }

            orderTickets.add(orderTicket);
        }

        for (Pair<TicketSchedule, Integer> pair : schedulesToReserve) {
            TicketSchedule ts = pair.getLeft();
            Integer qty = pair.getRight();
            ts.setReservedQuantity(ts.getReservedQuantity() + qty);
        }
        ticketScheduleRepository.saveAll(schedulesToReserve.stream().map(Pair::getLeft).toList());

        Order order = Order.builder()
                .user(user)
                .schedule(eventSchedule)
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .orderTickets(orderTickets)
                .isCheckedIn(false)
                .createdAt(LocalDateTime.now())
                .reservationTime(LocalDateTime.now())
                .build();

        orderTickets.forEach(ot -> ot.setOrder(order));
        orderRepository.save(order);

        // Lưu OrderTicketSeat
        if (!orderTicketSeats.isEmpty()) {
            orderTicketSeatRepository.saveAll(orderTicketSeats);
        }

        return new OrderReservationResponse(order.getOrderId(), order.getReservationTime());
    }
    
    @Override
    @Transactional
    public String createPaymentLink(Long orderId) throws Exception {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        long remainingTimeSeconds = 15 * 60
                - Duration.between(order.getReservationTime(), LocalDateTime.now()).getSeconds();
        if (remainingTimeSeconds <= 0 || order.getStatus() == OrderStatus.CANCELED) {
            cancelOrder(orderId);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }

        List<ItemData> items = order.getOrderTickets().stream()
                .map(ot -> ItemData.builder()
                        .name(ot.getTicket().getName())
                        .quantity(ot.getQuantity())
                        .price(ot.getTicket().getPrice().intValue())
                        .build())
                .collect(Collectors.toList());

        PaymentData paymentData = PaymentData.builder()
                .orderCode(order.getOrderId())
                .amount(order.getTotalPrice().intValue())
                .description("Payment for order " + order.getOrderId())
                .items(items)
                .returnUrl(payOSConfig.getReturnUrl())
                .cancelUrl(payOSConfig.getCancelUrl())
                .build();

        PayOS payOS = payOSService.getPayOSClient();
        CheckoutResponseData response = payOS.createPaymentLink(paymentData);

        order.setPaymentLinkId(response.getPaymentLinkId());
        orderRepository.save(order);

        Set<Long> usedDiscountIds = order.getOrderTickets().stream()
                .filter(ot -> ot.getDiscount() != null)
                .map(ot -> ot.getDiscount().getDiscountId())
                .collect(Collectors.toSet());
        paymentService.storeUsedDiscountIds(response.getPaymentLinkId(), usedDiscountIds);

        return response.getCheckoutUrl();

    }

    @Override
    // @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.CANCELED) {
            return new OrderStatusResponse(orderId, OrderStatus.CANCELED, 0);
        }

        long remainingTimeSeconds = 15 * 60
                - Duration.between(order.getReservationTime(), LocalDateTime.now()).getSeconds();
        if (remainingTimeSeconds <= 0) {
            cancelOrder(orderId);
            return new OrderStatusResponse(orderId, OrderStatus.CANCELED, 0);
        }

        return new OrderStatusResponse(orderId, order.getStatus(), remainingTimeSeconds);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!user.getUserId().equals(order.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_NOT_PENDING);
        }

        // reset seat status
        List<OrderTicketSeat> orderTicketSeats = orderTicketSeatRepository.findByOrderTicketIn(order.getOrderTickets());
        for (OrderTicketSeat ots : orderTicketSeats) {
            Seat seat = ots.getSeat();
            seat.setStatus(SeatStatus.AVAILABLE);
            seatRepository.save(seat);
        }

        // Reset reservedQuantity
        for (OrderTicket ot : order.getOrderTickets()) {
            TicketSchedule ts = ot.getTicket().getTicketSchedules().stream()
                    .filter(t -> t.getSchedule().getScheduleId().equals(order.getSchedule().getScheduleId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            ts.setReservedQuantity(ts.getReservedQuantity() - ot.getQuantity());
            ticketScheduleRepository.save(ts);
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setPaymentStatus(PaymentStatus.FAILED);
        orderRepository.save(order);
    }

}
