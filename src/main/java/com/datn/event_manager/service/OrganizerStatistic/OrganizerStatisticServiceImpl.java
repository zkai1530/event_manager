package com.datn.event_manager.service.OrganizerStatistic;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.response.OrganizerOverviewStatsDTO;
import com.datn.event_manager.dto.response.organizer_statistic.AttendanceStatusDTO;
import com.datn.event_manager.dto.response.organizer_statistic.ComplaintByReasonDTO;
import com.datn.event_manager.dto.response.organizer_statistic.RevenueByWeekDTO;
import com.datn.event_manager.dto.response.organizer_statistic.TicketPaymentStatusDTO;
import com.datn.event_manager.dto.response.organizer_statistic.TopTicketsSoldDTO;
import com.datn.event_manager.entity.CancelReason;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.repository.CancelReasonRepository;
import com.datn.event_manager.repository.ComplaintRepository;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.OrderRepository;
import com.datn.event_manager.repository.TicketScheduleRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrganizerStatisticServiceImpl implements OrganizerStatisticService {
    AuthenticationService authenticationService;
    EventRepository eventRepository;
    TicketScheduleRepository ticketScheduleRepository;
    ComplaintRepository complaintRepository;
    OrderRepository orderRepository;
    CancelReasonRepository cancelReasonRepository;

    @Override
    public OrganizerOverviewStatsDTO getOrganizerOverviewStat() {
        User user = authenticationService.getUserFromToken();

        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        // tổng sự kiện, sắp diễn ra, đã qua, bị tạm ẩn
        Long totalEvents = eventRepository.countByUser(user);
        Long upcomingEvents = eventRepository.countUpcomingEvents(user, currentDate, currentTime);
        Long pastEvents = eventRepository.countPastEvents(user, currentDate, currentTime);
        Long suspendedEvents = eventRepository.countSuspendedEvents(user);

        // tổng doanh thu từ tất cả sự kiện
        BigDecimal totalRevenue = orderRepository.sumTotalRevenueByUser(user);
        if (totalRevenue == null)
            totalRevenue = BigDecimal.ZERO;

        // tổng vé bán được
        Long totalSoldTickets = ticketScheduleRepository.sumTotalSoldTicketsByUser(user);

        Long totalComplaints = complaintRepository.countTotalComplaintsByUser(user);

        Long totalCheckIns = ticketScheduleRepository.sumTotalCheckInsByUser(user);

        return new OrganizerOverviewStatsDTO(
                totalEvents,
                upcomingEvents,
                pastEvents,
                suspendedEvents,
                totalRevenue,
                totalSoldTickets,
                totalComplaints,
                totalCheckIns);
    }

    @Override
    public TopTicketsSoldDTO[] getTopTicketsSold() {
        User user = authenticationService.getUserFromToken();

        PageRequest pageRequest = PageRequest.of(0, 5);
        Page<Object[]> topTickets = ticketScheduleRepository.findTopTicketsSoldByUser(user, pageRequest);
        return topTickets.getContent().stream()
                .map(topTicket -> new TopTicketsSoldDTO((Long) topTicket[0], (String) topTicket[1],
                        ((Number) topTicket[2]).longValue()))
                .toArray(TopTicketsSoldDTO[]::new);
    }

    @Override
    public RevenueByWeekDTO[] getRevenueByWeek(int year, int month) {
        User user = authenticationService.getUserFromToken();
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        int weeksInMonth = (int) Math.ceil(endDate.getDayOfMonth() / 7.0); // 4 hoặc 5 tuần

        List<Object[]> results = orderRepository.findRevenueByWeek(user, year, month);
        Map<LocalDate, Double> revenueByDate = results.stream()
                .collect(Collectors.toMap(
                        r -> ((java.sql.Date) r[0]).toLocalDate(),
                        r -> ((BigDecimal) r[1]).doubleValue(),
                        Double::sum));

        // tạo array két quả với 4/5 tuần tuần 1 từ 1->7 ....
        RevenueByWeekDTO[] result = new RevenueByWeekDTO[weeksInMonth];
        for (int week = 1; week <= weeksInMonth; week++) {
            LocalDate weekStart = startDate.plusDays((week - 1) * 7);
            LocalDate weekEnd = weekStart.plusDays(6).isAfter(endDate) ? endDate : weekStart.plusDays(6);
            double revenue = revenueByDate.entrySet().stream()
                    .filter(e -> !e.getKey().isBefore(weekStart) && !e.getKey().isAfter(weekEnd))
                    .mapToDouble(Map.Entry::getValue)
                    .sum();
            result[week - 1] = new RevenueByWeekDTO("Tuần " + week, revenue);
        }

        return result;
    }

    @Override
    public TicketPaymentStatusDTO getTicketPaymentStatus() {
        User user = authenticationService.getUserFromToken();

        Object result = orderRepository.countTicketPaymentStatusByUser(user);
        if (!(result instanceof Object[] row) || row.length < 3) {
            throw new RuntimeException("Invalid result from database");
        }

        return new TicketPaymentStatusDTO(
                ((Number) row[0]).longValue(),
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue());
    }

    @Override
    public ComplaintByReasonDTO[] getComplaintsByReason() {
        User user = authenticationService.getUserFromToken();

        List<CancelReason> allReasons = cancelReasonRepository.findAll();

        // Lấy số lượng khiếu nại theo lý do
        List<Object[]> results = complaintRepository.findComplaintsByReason(user);
        Map<String, Long> complaintCounts = results.stream()
                .collect(Collectors.toMap(
                        r -> (String) r[0], // reasonName
                        r -> ((Number) r[1]).longValue() // count
                ));

        // điền 0 nếu không có khiếu nại
        return allReasons.stream()
                .map(reason -> new ComplaintByReasonDTO(
                        reason.getReasonName(),
                        complaintCounts.getOrDefault(reason.getReasonName(), 0L)))
                .toArray(ComplaintByReasonDTO[]::new);
    }

    @Override
    public AttendanceStatusDTO getAttendanceStatus() {
        User user = authenticationService.getUserFromToken();
        Long totalSoldTickets = ticketScheduleRepository.sumTotalSoldTicketsByUser(user);
        Long totalCheckIns = ticketScheduleRepository.sumTotalCheckInsByUser(user);
        Long notCheckedIn = totalSoldTickets - totalCheckIns;
        return new AttendanceStatusDTO(totalCheckIns, notCheckedIn);
    }

}
