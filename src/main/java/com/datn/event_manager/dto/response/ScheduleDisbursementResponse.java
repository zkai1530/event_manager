package com.datn.event_manager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
public class ScheduleDisbursementResponse {
    Long scheduleId;
    LocalDate scheduleDate;
    LocalTime startTime;
    BigDecimal totalPrice;
    Long soldTickets;
    Long complaintTickets;
    Long totalAvailableQuantity;
    Long checkInCount;
    double complaintRatio;
    double checkInRatio;
    boolean isFraud;
    List<ComplaintDetail> complaints;
}
