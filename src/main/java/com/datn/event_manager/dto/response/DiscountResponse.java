package com.datn.event_manager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.datn.event_manager.enums.DiscountType;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountResponse {
    String discountId;
    String name;
    String promoCode;
    DiscountType discountType; // PERCENT or FIXED
    BigDecimal discountValue;
    Integer maxUses; 
    Integer timesUsed;
    LocalDateTime discountStart; 
    LocalDateTime discountEnd;
}
