package com.datn.event_manager.service.Disbursement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.ap.internal.util.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.response.ComplaintDetail;
import com.datn.event_manager.dto.response.DisbursementEligibleEventResponse;
import com.datn.event_manager.dto.response.ScheduleDisbursementResponse;
import com.datn.event_manager.entity.Complaint;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Order;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.EventMapper;
import com.datn.event_manager.repository.ComplaintRepository;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.EventScheduleRepository;
import com.datn.event_manager.repository.OrderRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DisbursementServiceImpl implements DisbursementService {
    EventScheduleRepository scheduleRepository;
    ComplaintRepository complaintRepository;
    OrderRepository orderRepository;
    EventRepository eventRepository;
    EventMapper eventMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public Page<DisbursementEligibleEventResponse> getEligibleDisbursementEvents(Pageable pageable) {
        LocalDate currentDate = LocalDate.now();
        Page<Event> events = eventRepository.findEventsEligibleForDisbursement(currentDate, pageable);
        return events.map(eventMapper::toEligibleEventResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public List<ScheduleDisbursementResponse> getUndisbursedSchedules(Long eventId) {
        LocalDate currentDate = LocalDate.now();
        List<EventSchedule> schedules = scheduleRepository.findUndisbursedSchedulesByEventId(currentDate, eventId);

        return schedules.stream()
                .map(schedule -> {
                    Long scheduleId = schedule.getScheduleId();

                    // Tổng tiền từ order với status paid
                    BigDecimal totalPrice = orderRepository.getTotalPaidAmountBySchedule(schedule);
                    if (totalPrice == null)
                        totalPrice = BigDecimal.ZERO;

                    // Tổng số vé đã bán (sold) và tổng check-in từ ticketSchedules đã fetch
                    List<TicketSchedule> ticketSchedules = schedule.getTicketSchedules() != null
                            ? schedule.getTicketSchedules()
                            : Collections.emptyList();
                    long soldTickets = ticketSchedules.stream()
                            .mapToLong(TicketSchedule::getSold)
                            .sum();
                    long checkInCount = ticketSchedules.stream()
                            .mapToLong(TicketSchedule::getCheckedInCount)
                            .sum();

                    // Số vé khiếu nại
                    Long complaintTickets = complaintRepository.countComplaintTicketsBySchedule(schedule);
                    if (complaintTickets == null)
                        complaintTickets = 0L;

                    // lấy complaint detail với tên người dùng và lý do
                    List<Complaint> complaints = complaintRepository.findByOrderSchedule(schedule);
                    List<ComplaintDetail> complaintDetails = complaints != null ? complaints.stream()
                            .map(complaint -> {
                                Order order = complaint.getOrder();
                                String userName = order != null && order.getUser() != null ? order.getUser().getName()
                                        : "Unknown";
                                String reasonName = complaint.getReason() != null
                                        ? complaint.getReason().getReasonName()
                                        : "Unknown";
                                return new ComplaintDetail(userName, reasonName);
                            })
                            .collect(Collectors.toList()) : Collections.emptyList();

                    // Tỷ lệ khiếu nại
                    double complaintRatio = (soldTickets > 0) ? (complaintTickets.doubleValue() / soldTickets) * 100
                            : 0;
                    // Tỷ lệ check-in
                    double checkInRatio = (soldTickets > 0) ? (checkInCount / (double) soldTickets) * 100 : 0;

                    // Đánh dấu gian lận
                    boolean isFraud = complaintRatio > 30 || checkInRatio < 50;

                    return new ScheduleDisbursementResponse(
                            scheduleId,
                            schedule.getScheduleDate(),
                            schedule.getStartTime(),
                            totalPrice,
                            soldTickets,
                            complaintTickets,
                            checkInCount,
                            complaintRatio,
                            checkInRatio,
                            isFraud,
                            complaintDetails);
                })
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void disbursed(Long scheduleId) {
        EventSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        if (schedule.getIsDisbursed() == true) {
                throw new AppException(ErrorCode.ALREADY_DISBURSED);
        }
        schedule.setIsDisbursed(true);
        scheduleRepository.save(schedule);
    }

   

}
