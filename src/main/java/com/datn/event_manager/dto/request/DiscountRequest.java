package com.datn.event_manager.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.antlr.v4.runtime.misc.NotNull;

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
public class DiscountRequest {
    String promoCode;
    DiscountType discountType; // PERCENT or FIXED
    BigDecimal discountValue;
    Integer maxUses; 
    LocalDateTime discountStart; 
    LocalDateTime discountEnd;
    List<Long> ticketIds;
}
