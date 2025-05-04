package com.datn.event_manager.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.User;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByUser(User user);

    Event findByUser(User user);

    @Query("SELECT COALESCE(SUM(DISTINCT t.sold), 0) " +
            "FROM Ticket t " +
            "JOIN t.ticketSchedules ts " +
            "JOIN ts.schedule es " +
            "WHERE es.event.eventId = :eventId")
    Integer getTotalTicketsSold(@Param("eventId") Long eventId);

    @Query("SELECT e.eventId, es.scheduleId, e.name " +
            "FROM Event e JOIN EventSchedule es ON e.eventId = es.event.eventId " +
            "WHERE es.scheduleDate = :tomorrow")
    List<Object[]> findSchedulesForTomorrow(LocalDate tomorrow);

    @Query(value = "SELECT DISTINCT e.* " +
                    "FROM event e " +
                    "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                    "LEFT JOIN event_schedule es ON e.event_id = es.event_id " +
                    "LEFT JOIN ticket_schedule ts ON es.schedule_id = ts.schedule_id " +
                    "LEFT JOIN ticket t ON ts.ticket_id = t.ticket_id " +
                    "WHERE e.name LIKE CONCAT('%', :keyword, '%') AND e.is_published = true " +
                    "AND (:location = 'Toàn quốc' OR el.city = :location OR el.address LIKE CONCAT('%', :location, '%')) "
                    +
                    "AND (:isFree = false OR t.price = 0) " +
                    "AND (:startDate IS NULL OR :endDate IS NULL OR es.schedule_date BETWEEN :startDate AND :endDate) "
                    +
                    "AND (:eventStatus = 'all' " +
                    "     OR (:eventStatus = 'ongoing' AND EXISTS (SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND es2.schedule_date >= CURRENT_DATE)) "
                    +
                    "     OR (:eventStatus = 'past' AND NOT EXISTS (SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND es2.schedule_date >= CURRENT_DATE))) "
                    +
                    "GROUP BY e.event_id " + // Thêm GROUP BY vì dùng MAX
                    "ORDER BY MAX(es.schedule_date) DESC", // Sắp xếp theo ngày lớn nhất, từ xa đến gần
                    countQuery = "SELECT COUNT(DISTINCT e.event_id) " +
                                    "FROM event e " +
                                    "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                                    "LEFT JOIN event_schedule es ON e.event_id = es.event_id " +
                                    "LEFT JOIN ticket_schedule ts ON es.schedule_id = ts.schedule_id " +
                                    "LEFT JOIN ticket t ON ts.ticket_id = t.ticket_id " +
                                    "WHERE e.name LIKE CONCAT('%', :keyword, '%') AND e.is_published = true " +
                                    "AND (:location = 'Toàn quốc' OR el.city = :location OR el.address LIKE CONCAT('%', :location, '%')) "
                                    +
                                    "AND (:isFree = false OR t.price = 0) " +
                                    "AND (:startDate IS NULL OR :endDate IS NULL OR es.schedule_date BETWEEN :startDate AND :endDate) "
                                    +
                                    "AND (:eventStatus = 'all' " +
                                    "     OR (:eventStatus = 'ongoing' AND EXISTS (SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND es2.schedule_date >= CURRENT_DATE)) "
                                    +
                                    "     OR (:eventStatus = 'past' AND NOT EXISTS (SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND es2.schedule_date >= CURRENT_DATE)))", nativeQuery = true)
    Page<Event> searchByName(
                    @Param("keyword") String keyword,
                    @Param("location") String location,
                    @Param("isFree") boolean isFree,
                    @Param("startDate") LocalDate startDate,
                    @Param("endDate") LocalDate endDate,
                    @Param("eventStatus") String eventStatus,
                    Pageable pageable);
}
