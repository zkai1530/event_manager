package com.datn.event_manager.service.Complaint;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.request.ComplaintRequest;
import com.datn.event_manager.entity.CancelReason;
import com.datn.event_manager.entity.Complaint;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.Complaint.ComplaintStatus;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.repository.CancelReasonRepository;
import com.datn.event_manager.repository.ComplaintRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ComplaintServiceImpl implements ComplaintService {
    AuthenticationService authenticationService;
    ComplaintRepository complaintRepository;
    OrderRepository orderRepository;
    CancelReasonRepository cancelReasonRepository;

    @Override
    public boolean existComplaint(Order order) {
        boolean exists = complaintRepository.existsByOrder(order);
        if (exists) {
            throw new AppException(ErrorCode.ALREADY_COMPLAINED);
        }
        return exists;
    }

    @Override
    public void complaint(ComplaintRequest request) {
        User user = authenticationService.getUserFromToken();

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        CancelReason reason = cancelReasonRepository.findById(request.getReasonId())
                .orElseThrow(() -> new AppException(ErrorCode.REASON_NOT_FOUND));

        // Check if the user is the owner of the event
        if (!user.getUserId().equals(order.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        existComplaint(order);

        Complaint complaint = Complaint.builder()
                .order(order)
                .reason(reason)
                .status(ComplaintStatus.pending)
                .createdAt(LocalDateTime.now())
                .build();
        complaintRepository.save(complaint);
    }

}
