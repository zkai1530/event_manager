package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.response.DiscountResponse;
import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.TicketDiscount;

@Mapper(componentModel = "spring")
public interface DiscountMapper {
    @Mapping(source = "discount.discountId", target = "discountId")
    @Mapping(source = "discount.name", target = "name")
    @Mapping(source = "discount.promoCode", target = "promoCode")
    @Mapping(source = "discount.discountType", target = "discountType")
    @Mapping(source = "discount.discountValue", target = "discountValue")
    @Mapping(source = "discount.maxUses", target = "maxUses")
    @Mapping(source = "discount.discountStart", target = "discountStart")
    @Mapping(source = "discount.discountEnd", target = "discountEnd")
    DiscountResponse toDiscountResponse(TicketDiscount ticketDiscount);


    List<DiscountResponse> toDiscountResponseList(List<Discount> discounts);
    DiscountResponse toDiscountResponse(Discount discounts);
}
