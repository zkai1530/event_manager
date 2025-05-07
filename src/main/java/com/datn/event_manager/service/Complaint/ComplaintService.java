package com.datn.event_manager.service.Complaint;

import com.datn.event_manager.dto.request.ComplaintRequest;
import com.datn.event_manager.entity.Order;

public interface ComplaintService {
    void complaint(ComplaintRequest request);

    boolean existComplaint(Order order);
}
