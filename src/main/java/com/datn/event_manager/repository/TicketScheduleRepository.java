package com.datn.event_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;

public interface TicketScheduleRepository extends JpaRepository<TicketSchedule, Long> {
    void deleteByTicket(Ticket ticket);

    List<TicketSchedule> findAllByScheduleIn(List<EventSchedule> schedules);

    List<TicketSchedule> findBySchedule(EventSchedule schedule);

    @Query("SELECT ts, t " +
            "FROM TicketSchedule ts " +
            "JOIN ts.ticket t " +
            "WHERE ts.schedule.scheduleId = :scheduleId")
    List<Object[]> findTicketSchedulesByScheduleId(@Param("scheduleId") Long scheduleId);

    @Query("SELECT COALESCE(SUM(ts.checkedInCount), 0) FROM TicketSchedule ts WHERE ts.schedule.scheduleId = :scheduleId")
    Long countCheckedInByScheduleId(@Param("scheduleId") Long scheduleId);

    // thống kê cho organizer
    @Query("SELECT COALESCE(SUM(ts.sold), 0) FROM TicketSchedule ts WHERE ts.schedule.event.user = :user")
    Long sumTotalSoldTicketsByUser(@Param("user") User user);

    // * đếm tổng check in của tất cả sự kiện
    @Query("SELECT COALESCE(SUM(ts.checkedInCount), 0) FROM TicketSchedule ts WHERE ts.schedule.event.user = :user")
    Long sumTotalCheckInsByUser(@Param("user") User user);

    // * tìm top 5 sự kiện được mua nhiều vé nhất

    @Query("SELECT ts.schedule.event.id AS eventId, ts.schedule.event.name AS eventName, SUM(ts.sold) AS soldTickets " +
            "FROM TicketSchedule ts " +
            "WHERE ts.schedule.event.user = :user " +
            "GROUP BY ts.schedule.event.id, ts.schedule.event.name " +
            "ORDER BY SUM(ts.sold) DESC")
    Page<Object[]> findTopTicketsSoldByUser(@Param("user") User user, Pageable pageable);

    // admin dashboard
    // * tổng vé bán được
    @Query("SELECT SUM(ts.sold) FROM TicketSchedule ts WHERE ts.sold != 0")
    Long getTotalTicketsSold();

        // * tỉ lệ check in
    @Query("SELECT (SUM(ts.checkedInCount) * 100.0 / SUM(ts.sold)) FROM TicketSchedule ts WHERE (ts.sold != 0 AND ts.checkedInCount != 0)")
    Double getCheckInRate();
}
