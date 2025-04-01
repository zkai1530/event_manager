package com.datn.event_manager.service.Discount;

import java.util.List;

import com.datn.event_manager.dto.request.DiscountRequest;
import com.datn.event_manager.dto.response.DiscountResponse;

public interface DiscountService {
    void createDiscount(DiscountRequest request);

    DiscountResponse updateDiscount(Long discountId, DiscountRequest request);

    void deleteDiscount (Long discountId);

    List<DiscountResponse> viewAllDiscountByEventId(Long eventId);

    DiscountResponse viewDiscountById(Long discountId);
}
