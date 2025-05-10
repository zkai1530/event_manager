package com.datn.event_manager.dto.response;

import java.math.BigDecimal;

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
public class OrganizerOverviewStatsDTO {
    Long totalEvents;
    Long upcomingEvents;
    Long pastEvents;
    Long suspendedEvents;
    BigDecimal totalRevenue;
    Long totalSoldTickets;
    Long totalComplaints;
    Long totalCheckIns;
}
