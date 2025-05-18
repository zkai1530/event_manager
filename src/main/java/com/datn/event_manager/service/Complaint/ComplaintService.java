package com.datn.event_manager.service.Complaint;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.request.ComplaintRequest;
import com.datn.event_manager.dto.response.ComplaintResponse;
import com.datn.event_manager.entity.Order;

public interface ComplaintService {
    void complaint(ComplaintRequest request);

    boolean existComplaint(Order order);

    Page<ComplaintResponse> getAllComplaint(Pageable pageable);
}
