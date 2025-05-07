package com.datn.event_manager.service.Disbursement;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.response.DisbursementEligibleEventResponse;
import com.datn.event_manager.dto.response.ScheduleDisbursementResponse;

public interface DisbursementService {
    List<ScheduleDisbursementResponse> getUndisbursedSchedules(Long eventId);

    void disbursed(Long scheduleId);

    Page<DisbursementEligibleEventResponse> getEligibleDisbursementEvents(Pageable pageable);
}
