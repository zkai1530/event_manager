package com.datn.event_manager.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.dto.response.EventInAdminResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.User;

public interface EventRepository extends JpaRepository<Event, Long> {
        // List<Event> findAllByUser(User user);

        Event findByUser(User user);

        // @Query("SELECT COALESCE(SUM(DISTINCT t.sold), 0) " +
        // "FROM Ticket t " +
        // "JOIN t.ticketSchedules ts " +
        // "JOIN ts.schedule es " +
        // "WHERE es.event.eventId = :eventId")
        // Integer getTotalTicketsSold(@Param("eventId") Long eventId);
        @Query("SELECT COALESCE(SUM(ts.sold), 0) " +
                        "FROM TicketSchedule ts " +
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

        // use for get event by user
        Page<Event> findAllPagedByUser(User user, Pageable pageable);

        // @Query("SELECT DISTINCT e FROM Event e " +
        // "LEFT JOIN FETCH e.schedules s " +
        // "WHERE e.isPublished = true AND e.isSuspended = false " +
        // "AND EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event = e AND
        // es.scheduleDate < :currentDate AND es.isDisbursed = false) "
        // +
        // "AND EXISTS (SELECT 1 FROM Order o WHERE o.schedule IN (SELECT es2 FROM
        // EventSchedule es2 WHERE es2.event = e) AND o.status = 'PAID')")
        // Page<Event> findEventsEligibleForDisbursement(@Param("currentDate") LocalDate
        // currentDate, Pageable pageable);
        @Query("SELECT DISTINCT e FROM Event e " +
                        "LEFT JOIN FETCH e.schedules s " +
                        "WHERE e.isPublished = true " +
                        "AND EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event = e AND es.scheduleDate < :currentDate AND es.isDisbursed = false) "
                        +
                        "AND EXISTS (SELECT 1 FROM Order o WHERE o.schedule IN (SELECT es2 FROM EventSchedule es2 WHERE es2.event = e) AND o.status = 'PAID')")
        Page<Event> findEventsEligibleForDisbursement(@Param("currentDate") LocalDate currentDate, Pageable pageable);

        // thống kê cho organizer
        @Query("SELECT COUNT(e) FROM Event e WHERE e.user = :user AND e.isPublished = true")
        Long countByUser(@Param("user") User user);

        @Query("SELECT COUNT(DISTINCT e) FROM Event e " +
                        "WHERE e.user = :user " +
                        "AND e.isPublished = true " +
                        "AND EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event = e AND es.scheduleDate >= :currentDate AND (es.scheduleDate > :currentDate OR (es.scheduleDate = :currentDate AND es.startTime > :currentTime)))")
        Long countUpcomingEvents(@Param("user") User user, @Param("currentDate") LocalDate currentDate,
                        @Param("currentTime") LocalTime currentTime);

        @Query("SELECT COUNT(DISTINCT e) FROM Event e " +
                        "WHERE e.user = :user " +
                        "AND e.isPublished = true " +
                        "AND NOT EXISTS (SELECT 1 FROM EventSchedule es WHERE es.event = e AND es.scheduleDate >= :currentDate AND (es.scheduleDate > :currentDate OR (es.scheduleDate = :currentDate AND es.startTime > :currentTime)))")
        Long countPastEvents(@Param("user") User user, @Param("currentDate") LocalDate currentDate,
                        @Param("currentTime") LocalTime currentTime);

        @Query("SELECT COUNT(e) FROM Event e WHERE e.user = :user AND e.isSuspended = true")
        Long countSuspendedEvents(@Param("user") User user);

        // homepage
        @Query(value = """
                            SELECT e.event_id, e.name, e.image_url, e.slug,
                                   (SELECT MIN(es.schedule_date) FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW()) as schedule_date,
                                   COALESCE((SELECT SUM(ot.quantity) FROM order_ticket ot JOIN `order` o ON ot.order_id = o.order_id
                                            JOIN ticket t ON ot.ticket_id = t.ticket_id
                                            JOIN ticket_schedule ts ON t.ticket_id = ts.ticket_id
                                            JOIN event_schedule es2 ON ts.schedule_id = es2.schedule_id
                                            WHERE es2.event_id = e.event_id), 0) as sold_tickets,
                                   (SELECT MIN(t.price) FROM ticket t
                                    JOIN ticket_schedule ts ON t.ticket_id = ts.ticket_id
                                    JOIN event_schedule es3 ON ts.schedule_id = es3.schedule_id
                                    WHERE es3.event_id = e.event_id) as min_price
                            FROM `event` e
                            WHERE e.is_published = 1
                            AND EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW())
                            ORDER BY COALESCE((SELECT SUM(ot.quantity) FROM order_ticket ot JOIN `order` o ON ot.order_id = o.order_id
                                              JOIN ticket t ON ot.ticket_id = t.ticket_id
                                              JOIN ticket_schedule ts ON t.ticket_id = ts.ticket_id
                                              JOIN event_schedule es2 ON ts.schedule_id = es2.schedule_id
                                              WHERE es2.event_id = e.event_id), 0) DESC
                            LIMIT 20
                        """, nativeQuery = true)
        List<Object[]> findTrendingEvents();

        // 2. Random Events
        @Query(value = """
                            SELECT e.event_id, e.name, e.image_url, e.slug,
                                   (SELECT MIN(es.schedule_date) FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW()) as schedule_date,
                                   0 as sold_tickets,
                                   (SELECT MIN(t.price) FROM ticket t
                                    JOIN ticket_schedule ts ON t.ticket_id = ts.ticket_id
                                    JOIN event_schedule es3 ON ts.schedule_id = es3.schedule_id
                                    WHERE es3.event_id = e.event_id) as min_price
                            FROM `event` e
                            WHERE e.is_published = 1
                            AND EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW())
                            ORDER BY RAND()
                            LIMIT 20
                        """, nativeQuery = true)
        List<Object[]> findRandomEvents();

        // 3. Events This Weekend or Month
        @Query(value = """
                            SELECT e.event_id, e.name, e.image_url, e.slug,
                                   (SELECT MIN(es.schedule_date) FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW()) as schedule_date,
                                   0 as sold_tickets,
                                   (SELECT MIN(t.price) FROM ticket t
                                    JOIN ticket_schedule ts ON t.ticket_id = ts.ticket_id
                                    JOIN event_schedule es3 ON ts.schedule_id = es3.schedule_id
                                    WHERE es3.event_id = e.event_id) as min_price
                            FROM `event` e
                            WHERE e.is_published = 1
                            AND EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND es.schedule_date > NOW())
                            AND EXISTS (SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND es2.schedule_date BETWEEN ?1 AND ?2)
                            GROUP BY e.event_id, e.name, e.image_url
                            ORDER BY (SELECT MIN(es3.schedule_date) FROM event_schedule es3 WHERE es3.event_id = e.event_id AND es3.schedule_date BETWEEN ?1 AND ?2) ASC
                            LIMIT 20
                        """, nativeQuery = true)
        List<Object[]> findEventsByDateRange(LocalDate startDate, LocalDate endDate);

        // admin event management
        long count();

        @Query("SELECT COALESCE(SUM(ts.sold), 0) FROM TicketSchedule ts " +
                        "WHERE ts.schedule IN (SELECT s FROM EventSchedule s JOIN s.event e WHERE e.isPublished = true AND e.isSuspended = false)")
        Long getTotalTicketSales();

        @Query("SELECT COUNT(DISTINCT e) FROM Event e " +
                        "WHERE e.isPublished = true " +
                        "AND e.isSuspended = false " +
                        "AND NOT EXISTS (" +
                        "  SELECT 1 FROM EventSchedule es " +
                        "  WHERE es.event = e " +
                        "  AND (es.scheduleDate > CURRENT_DATE " +
                        "  OR (es.scheduleDate = CURRENT_DATE AND es.endTime >= FUNCTION('CURRENT_TIME'))))")
        long countCompletedEvents();

        @Query("SELECT COUNT(DISTINCT e) FROM Event e " +
                        "WHERE e.isPublished = true " +
                        "AND e.isSuspended = false " +
                        "AND EXISTS (" +
                        "  SELECT 1 FROM EventSchedule es " +
                        "  WHERE es.event = e " +
                        "  AND (es.scheduleDate > CURRENT_DATE " +
                        "  OR (es.scheduleDate = CURRENT_DATE AND es.startTime > FUNCTION('CURRENT_TIME'))))")
        long countUpcomingEvents();

        // * Lọc theo trạng thái
        @Query(value = "SELECT e.event_id AS eventId, e.name, e.image_url, COALESCE(c.category_name, 'Không xác định') AS categoryName, "
                        +
                        "el.city, el.address, el.country, " +
                        "COALESCE((SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketSold, "
                        +
                        "COALESCE((SELECT SUM(COALESCE(ts.available_quantity, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketTotal, "
                        +
                        "CASE " +
                        "  WHEN e.is_suspended = TRUE THEN 'Đã ẩn' " +
                        "  WHEN e.is_published = FALSE THEN 'Chưa đăng' " +
                        "  WHEN EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.start_time > CURTIME()))) THEN 'Sắp diễn ra' "
                        +
                        "  WHEN NOT EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.end_time >= CURTIME()))) THEN 'Đã diễn ra' "
                        +
                        "  ELSE 'Đã đăng' END AS status " +
                        "FROM event e " +
                        "LEFT JOIN event_categories c ON e.category_id = c.category_id " +
                        "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                        "WHERE (:status IS NULL OR " +
                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR " +
                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                        +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                        +
                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS (" +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME())))))", countQuery = "SELECT COUNT(*) FROM event e "
                                        +
                                        "WHERE (:status IS NULL OR " +
                                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR "
                                        +
                                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                                        +
                                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME())))))", nativeQuery = true)
        Page<EventInAdminResponse> findEventsByStatus(@Param("status") String status, Pageable pageable);

        // * Lọc theo trạng thái và sắp xếp theo createdAt
        @Query(value = "SELECT e.event_id AS eventId, e.name, e.image_url, COALESCE(c.category_name, 'Không xác định') AS categoryName, "
                        +
                        "el.city, el.address, el.country, " +
                        "COALESCE((SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketSold, "
                        +
                        "COALESCE((SELECT SUM(COALESCE(ts.available_quantity, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketTotal, "
                        +
                        "CASE " +
                        "  WHEN e.is_suspended = TRUE THEN 'Đã ẩn' " +
                        "  WHEN e.is_published = FALSE THEN 'Chưa đăng' " +
                        "  WHEN EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.start_time > CURTIME()))) THEN 'Sắp diễn ra' "
                        +
                        "  WHEN NOT EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.end_time >= CURTIME()))) THEN 'Đã diễn ra' "
                        +
                        "  ELSE 'Đã đăng' END AS status " +
                        "FROM event e " +
                        "LEFT JOIN event_categories c ON e.category_id = c.category_id " +
                        "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                        "WHERE (:status IS NULL OR " +
                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR " +
                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                        +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                        +
                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS (" +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME()))))) "
                        +
                        "ORDER BY e.created_at DESC", countQuery = "SELECT COUNT(*) FROM event e " +
                                        "WHERE (:status IS NULL OR " +
                                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR "
                                        +
                                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                                        +
                                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME())))))", nativeQuery = true)
        Page<EventInAdminResponse> findEventsByStatusOrderByCreatedAtDesc(@Param("status") String status,
                        Pageable pageable);

        // * Lọc theo trạng thái và sắp xếp theo vé bán nhiều nhất
        @Query(value = "SELECT e.event_id AS eventId, e.name, e.image_url, COALESCE(c.category_name, 'Không xác định') AS categoryName, "
                        +
                        "el.city, el.address, el.country, " +
                        "COALESCE((SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketSold, "
                        +
                        "COALESCE((SELECT SUM(COALESCE(ts.available_quantity, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketTotal, "
                        +
                        "CASE " +
                        "  WHEN e.is_suspended = TRUE THEN 'Đã ẩn' " +
                        "  WHEN e.is_published = FALSE THEN 'Chưa đăng' " +
                        "  WHEN EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.start_time > CURTIME()))) THEN 'Sắp diễn ra' "
                        +
                        "  WHEN NOT EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.end_time >= CURTIME()))) THEN 'Đã diễn ra' "
                        +
                        "  ELSE 'Đã đăng' END AS status " +
                        "FROM event e " +
                        "LEFT JOIN event_categories c ON e.category_id = c.category_id " +
                        "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                        "WHERE (:status IS NULL OR " +
                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR " +
                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                        +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                        +
                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS (" +
                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME()))))) "
                        +
                        "ORDER BY (SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id) DESC", countQuery = "SELECT COUNT(*) FROM event e "
                                        +
                                        "WHERE (:status IS NULL OR " +
                                        "  (:status = 'published' AND e.is_published = TRUE AND e.is_suspended = FALSE) OR "
                                        +
                                        "  (:status = 'hidden' AND e.is_suspended = TRUE) OR " +
                                        "  (:status = 'completed' AND e.is_published = TRUE AND e.is_suspended = FALSE AND NOT EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.end_time >= CURTIME())))) OR "
                                        +
                                        "  (:status = 'upcoming' AND e.is_published = TRUE AND e.is_suspended = FALSE AND EXISTS ("
                                        +
                                        "    SELECT 1 FROM event_schedule es2 WHERE es2.event_id = e.event_id AND " +
                                        "    (es2.schedule_date > CURDATE() OR (es2.schedule_date = CURDATE() AND es2.start_time > CURTIME())))))", nativeQuery = true)
        Page<EventInAdminResponse> findEventsByStatusOrderByTicketSalesDesc(@Param("status") String status,
                        Pageable pageable);

        // * Lấy tất cả và sắp xếp theo vé bán nhiều nhất
        @Query(value = "SELECT e.event_id AS eventId, e.name, e.image_url, COALESCE(c.category_name, 'Không xác định') AS categoryName, "
                        +
                        "el.city, el.address, el.country, " +
                        "COALESCE((SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketSold, "
                        +
                        "COALESCE((SELECT SUM(COALESCE(ts.available_quantity, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id), 0) AS ticketTotal, "
                        +
                        "CASE " +
                        "  WHEN e.is_suspended = TRUE THEN 'Đã ẩn' " +
                        "  WHEN e.is_published = FALSE THEN 'Chưa đăng' " +
                        "  WHEN EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.start_time > CURTIME()))) THEN 'Sắp diễn ra' "
                        +
                        "  WHEN NOT EXISTS (SELECT 1 FROM event_schedule es WHERE es.event_id = e.event_id AND " +
                        "    (es.schedule_date > CURDATE() OR (es.schedule_date = CURDATE() AND es.end_time >= CURTIME()))) THEN 'Đã diễn ra' "
                        +
                        "  ELSE 'Đã đăng' END AS status " +
                        "FROM event e " +
                        "LEFT JOIN event_categories c ON e.category_id = c.category_id " +
                        "LEFT JOIN event_location el ON e.event_id = el.event_id " +
                        "ORDER BY (SELECT SUM(COALESCE(ts.sold, 0)) FROM ticket_schedule ts JOIN event_schedule es ON ts.schedule_id = es.schedule_id WHERE es.event_id = e.event_id) DESC", countQuery = "SELECT COUNT(*) FROM event e", nativeQuery = true)
        Page<EventInAdminResponse> findAllOrderByTicketSalesDesc(Pageable pageable);

}
