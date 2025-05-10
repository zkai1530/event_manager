package com.datn.event_manager.service.OrganizerStatistic;

import com.datn.event_manager.dto.response.OrganizerOverviewStatsDTO;
import com.datn.event_manager.dto.response.organizer_statistic.AttendanceStatusDTO;
import com.datn.event_manager.dto.response.organizer_statistic.ComplaintByReasonDTO;
import com.datn.event_manager.dto.response.organizer_statistic.RevenueByWeekDTO;
import com.datn.event_manager.dto.response.organizer_statistic.TicketPaymentStatusDTO;
import com.datn.event_manager.dto.response.organizer_statistic.TopTicketsSoldDTO;

public interface OrganizerStatisticService {
    OrganizerOverviewStatsDTO getOrganizerOverviewStat();

    TopTicketsSoldDTO[] getTopTicketsSold();

    RevenueByWeekDTO[] getRevenueByWeek(int year, int month);

    TicketPaymentStatusDTO getTicketPaymentStatus();

    ComplaintByReasonDTO[] getComplaintsByReason();

    AttendanceStatusDTO getAttendanceStatus();
}
