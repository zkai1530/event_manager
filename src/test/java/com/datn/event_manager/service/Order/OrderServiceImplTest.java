package com.datn.event_manager.service.Order;

import com.datn.event_manager.configuration.PayOSConfig;
import com.datn.event_manager.dto.request.OrderRequest;
import com.datn.event_manager.dto.request.TicketItem;
import com.datn.event_manager.dto.response.OrderReservationResponse;
import com.datn.event_manager.dto.response.OrderStatusResponse;
import com.datn.event_manager.entity.*;
import com.datn.event_manager.entity.Order.OrderStatus;
import com.datn.event_manager.entity.Order.PaymentStatus;
import com.datn.event_manager.enums.DiscountType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.repository.*;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.service.PayOS.PayOSService;
import com.datn.event_manager.service.Payment.PaymentService;

import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @InjectMocks
    private OrderServiceImpl orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private EventScheduleRepository scheduleRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketScheduleRepository ticketScheduleRepository;

    @Mock
    private DiscountRepository discountRepository;

    @Mock
    private TicketDiscountRepository ticketDiscountRepository;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private PayOSService payOSService;

    @Mock
    private PayOSConfig payOSConfig;

    private OrderRequest orderRequest;
    private EventSchedule eventSchedule;
    private Ticket ticket;
    private TicketSchedule ticketSchedule;
    private Discount discount;
    private Order order;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId("user1");

        orderRequest = new OrderRequest();
        orderRequest.setScheduleId(1L);
        TicketItem item = new TicketItem();
        item.setTicketId(1L);
        item.setQuantity(2);
        item.setDiscountIds(List.of(1L));
        orderRequest.setTickets(List.of(item));

        eventSchedule = new EventSchedule();
        eventSchedule.setScheduleId(1L);

        ticket = new Ticket();
        ticket.setTicketId(1L);
        ticket.setName("VIP Ticket");
        ticket.setPrice(new BigDecimal("100.00"));
        ticket.setSaleEnd(LocalDateTime.now().plusDays(1));

        ticketSchedule = new TicketSchedule();
        ticketSchedule.setTicket(ticket);
        ticketSchedule.setSchedule(eventSchedule);
        ticketSchedule.setAvailableQuantity(100);
        ticketSchedule.setSold(0);
        ticketSchedule.setReservedQuantity(0);
        ticket.setTicketSchedules(List.of(ticketSchedule));

        discount = new Discount();
        discount.setDiscountId(1L);
        discount.setDiscountType(DiscountType.PERCENT);
        discount.setDiscountValue(new BigDecimal("10"));
        discount.setDiscountStart(LocalDateTime.now().minusDays(1));
        discount.setDiscountEnd(LocalDateTime.now().plusDays(1));
        discount.setMaxUses(100);
        discount.setTimesUsed(0);

        order = new Order();
        order.setOrderId(1L);
        order.setUser(user);
        order.setSchedule(eventSchedule);
        order.setTotalPrice(new BigDecimal("180.00")); // 2 tickets * (100 - 10% = 90)
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setReservationTime(LocalDateTime.now());
        order.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testReserveOrder_Success() throws Exception {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(eventSchedule));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(discountRepository.findById(1L)).thenReturn(Optional.of(discount));
        when(ticketDiscountRepository.existsByTicketAndDiscount(ticket, discount)).thenReturn(true);
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(ticketScheduleRepository.saveAll(anyList())).thenReturn(List.of(ticketSchedule));

        // When
        OrderReservationResponse response = orderService.reserveOrder(orderRequest);

        // Then
        assertNotNull(response);
        assertEquals(null, response.getOrderId());
        verify(scheduleRepository).findById(1L);
        verify(ticketRepository).findById(1L);
        verify(ticketDiscountRepository).existsByTicketAndDiscount(ticket, discount);
        verify(orderRepository).save(any(Order.class));
        verify(ticketScheduleRepository).saveAll(anyList());
    }

    @Test
    void testReserveOrder_Fail_ScheduleNotFound() throws Exception {
        // Given
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> orderService.reserveOrder(orderRequest));
        assertEquals("Schedule not found!", exception.getErrorCode().getMessage());
        verify(scheduleRepository).findById(1L);
        verifyNoInteractions(ticketRepository, orderRepository);
    }

    @Test
    void testReserveOrder_Fail_TicketNotAvailable() throws Exception {
        // Given
        ticket.setSaleEnd(LocalDateTime.now().minusDays(1)); // Expired
        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(eventSchedule));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> orderService.reserveOrder(orderRequest));
        assertEquals("Ticket not available!", exception.getErrorCode().getMessage());
        verify(scheduleRepository).findById(1L);
        verify(ticketRepository).findById(1L);
    }

    @Test
    void testGetOrderStatus_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // When
        OrderStatusResponse response = orderService.getOrderStatus(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getOrderId());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        verify(orderRepository).findById(1L);
    }

    @Test
    void testCancelOrder_Success() throws Exception {
        // Given
        OrderTicket orderTicket = new OrderTicket();
        orderTicket.setTicket(ticket);
        orderTicket.setQuantity(2);
        order.setOrderTickets(List.of(orderTicket));

        when(authenticationService.getUserFromToken()).thenReturn(user);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(ticketScheduleRepository.save(any(TicketSchedule.class))).thenReturn(ticketSchedule);

        // When
        orderService.cancelOrder(1L);

        // Then
        assertEquals(OrderStatus.CANCELED, order.getStatus());
        verify(orderRepository).findById(1L);
        verify(orderRepository).save(order);
        verify(ticketScheduleRepository).save(any(TicketSchedule.class));
    }

    @Test
    void testCancelOrder_Fail_Unauthorized() throws Exception {
        // Given
        User differentUser = new User();
        differentUser.setUserId("user2");
        when(authenticationService.getUserFromToken()).thenReturn(differentUser);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> orderService.cancelOrder(1L));
        assertEquals("Access Denied! (unauthorized)", exception.getErrorCode().getMessage());
        verify(orderRepository).findById(1L);
        verifyNoMoreInteractions(orderRepository);
    }

    @Test
    void testCreatePaymentLink_Success() throws Exception {
        // Given
        OrderTicket orderTicket = new OrderTicket();
        orderTicket.setTicket(ticket);
        orderTicket.setQuantity(2);
        order.setOrderTickets(new ArrayList<>(List.of(orderTicket)));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(payOSConfig.getReturnUrl()).thenReturn("http://return.url");
        when(payOSConfig.getCancelUrl()).thenReturn("http://cancel.url");
        PayOS payOS = mock(PayOS.class);
        when(payOSService.getPayOSClient()).thenReturn(payOS);
        CheckoutResponseData responseData = mock(CheckoutResponseData.class);
        when(responseData.getPaymentLinkId()).thenReturn("123");
        when(responseData.getCheckoutUrl()).thenReturn("https://payos.vn/checkout/123");
        when(payOS.createPaymentLink(any(PaymentData.class))).thenReturn(responseData);
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        doNothing().when(paymentService).storeUsedDiscountIds(anyString(), anySet());

        // When
        String result = orderService.createPaymentLink(1L);

        // Then
        assertEquals("https://payos.vn/checkout/123", result);
        verify(orderRepository).findById(1L);
        verify(orderRepository).save(any(Order.class));
        verify(payOSService).getPayOSClient();
        verify(payOS).createPaymentLink(any(PaymentData.class));
        verify(paymentService).storeUsedDiscountIds(anyString(), anySet());
    }

    @Test
    void testCreatePaymentLink_Fail_OrderNotFound() throws Exception {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> orderService.createPaymentLink(1L));
        assertEquals(ErrorCode.ORDER_NOT_FOUND.getMessage(), exception.getErrorCode().getMessage());
        verify(orderRepository).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
        verify(payOSService, never()).getPayOSClient();
        verify(paymentService, never()).storeUsedDiscountIds(anyString(), anySet());
    }
}