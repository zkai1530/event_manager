package com.datn.event_manager.service.Event;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.datn.event_manager.controller.TicketController;
import com.datn.event_manager.dto.request.EventLocationRequest;
import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.request.FAQRequest;
import com.datn.event_manager.dto.response.CategoryAndThemeResponse;
import com.datn.event_manager.dto.response.EventByUserResponse;
import com.datn.event_manager.dto.response.EventHomepageResponse;
import com.datn.event_manager.dto.response.EventInAdminResponse;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.dto.response.EventSearchResponse;
import com.datn.event_manager.dto.response.EventStatusResponse;
import com.datn.event_manager.dto.response.admin_statistic.ThemeEventCountResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventCategories;
import com.datn.event_manager.entity.EventLocation;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.EventThemes;
import com.datn.event_manager.entity.FAQ;
import com.datn.event_manager.entity.OrderTicket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.EventMapper;
import com.datn.event_manager.repository.*;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.service.Cloudinary.CloudinaryService;
import com.datn.event_manager.service.Notification.NotificationService;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventServiceImpl implements EventService {
    EventRepository eventRepository;
    EventLocationRepository eventLocationRepository;
    EventScheduleRepository eventScheduleRepository;
    EventThemesRepository eventThemesRepository;
    EventCategoriesRepository eventCategoriesRepository;
    TicketRepository ticketRepository;
    TicketScheduleRepository ticketScheduleRepository;
    EventMapper eventMapper;
    FAQRepository faqRepository;
    AuthenticationService authenticationService;
    CloudinaryService cloudinaryService;
    NotificationService notificationService;

    @Override
    public String createEvent(EventRequest eventRequest, MultipartFile file) {
        User user = authenticationService.getUserFromToken();
        String imageUrl = null;
        if (file != null) {
            try {
                imageUrl = cloudinaryService.uploadImage(file);
            } catch (IOException e) {
                throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
            }
        }
        Event event = Event.builder()
                .user(user)
                .name(eventRequest.getName())
                .summary(eventRequest.getSummary())
                .description(eventRequest.getDescription())
                .imageUrl(imageUrl)
                .capacity(eventRequest.getCapacity())
                .eventType(eventRequest.getEventType())
                .isPublished(false)
                .isSuspended(false)
                .hasSeatMap(eventRequest.getHasSeatMap())
                .createdAt(LocalDateTime.now())
                .build();
        eventRepository.save(event);

        String slug = toSlug(event.getName()) + "-" + event.getEventId();
        event.setSlug(slug);
        eventRepository.save(event);

        // Location
        if (eventRequest.getEventLocationRequest() != null) {
            EventLocationRequest eventLocationRequest = eventRequest.getEventLocationRequest();

            EventLocation location = new EventLocation();
            location.setEvent(event);

            if (eventLocationRequest.getAddress() != null)
                location.setAddress(eventLocationRequest.getAddress());
            if (eventLocationRequest.getCity() != null)
                location.setCity(eventLocationRequest.getCity());
            if (eventLocationRequest.getCountry() != null)
                location.setCountry(eventLocationRequest.getCountry());
            if (eventLocationRequest.getPostalCode() != null)
                location.setPostalCode(eventLocationRequest.getPostalCode());

            eventLocationRepository.save(location);
        }

        // EventType
        if (eventRequest.getEventType() == EventType.SINGLE) {
            if (eventRequest.getEventDate() == null || eventRequest.getStartTime() == null
                    || eventRequest.getEndTime() == null) {
                throw new AppException(ErrorCode.DATE_TIME_IS_NULL);
            }

            if (!eventRequest.getEndTime().isAfter(eventRequest.getStartTime())) {
                throw new IllegalArgumentException("End time must be after start time.");
            }

            EventSchedule eventSchedule = EventSchedule.builder()
                    .event(event)
                    .scheduleDate(eventRequest.getEventDate())
                    .startTime(eventRequest.getStartTime())
                    .endTime(eventRequest.getEndTime())
                    .isDisbursed(false)
                    .build();

            eventScheduleRepository.save(eventSchedule);
        }

        // FAQ
        if (eventRequest.getFaqs() != null && !eventRequest.getFaqs().isEmpty()) {
            List<FAQ> faqs = eventRequest.getFaqs().stream()
                    .map(faqRequest -> FAQ.builder()
                            .event(event)
                            .answer(faqRequest.getAnswer())
                            .question(faqRequest.getQuestion())
                            .build())
                    .collect(Collectors.toList());

            faqRepository.saveAll(faqs);
        }
        return event.getEventId().toString();
    }

    @Override
    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return eventMapper.toEventResponse(events);
    }

    @Override
    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (event.getIsSuspended()) {
            throw new AppException(ErrorCode.EVENT_NOT_FOUND);
        }

        return eventMapper.toEventResponse(event);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request, MultipartFile file) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        // check user have permission ? (authorized?)
        User user = authenticationService.getUserFromToken();
        if (user.getUserId() != event.getUser().getUserId()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the event is published, can't edit information
        if (event.getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Check if any ticket has sold tickets
        boolean hasSoldTickets = false;
        List<EventSchedule> schedules = eventScheduleRepository.findAllByEvent(event);
        for (EventSchedule schedule : schedules) {
            List<TicketSchedule> ticketSchedules = ticketScheduleRepository.findBySchedule(schedule);
            for (TicketSchedule ticketSchedule : ticketSchedules) {
                if (ticketSchedule.getSold() > 0) {
                    hasSoldTickets = true;
                    break;
                }
            }
            if (hasSoldTickets)
                break;
        }

        // Check for location changes
        boolean locationChanged = false;
        EventLocation location = event.getEventLocation();
        EventLocationRequest eventLocationRequest = request.getEventLocationRequest();
        if (eventLocationRequest != null) {
            if (location == null) {
                locationChanged = true; // New location is a change
            } else {
                if (!eventLocationRequest.getAddress().equals(location.getAddress()) ||
                        !eventLocationRequest.getCity().equals(location.getCity()) ||
                        !eventLocationRequest.getCountry().equals(location.getCountry()) ||
                        !eventLocationRequest.getPostalCode().equals(location.getPostalCode())) {
                    locationChanged = true;
                }
            }
        }
        // Prevent updating location if tickets are sold and location changed
        if (hasSoldTickets && locationChanged) {
            throw new IllegalArgumentException(
                    "Cannot update location for event " + event.getName() +
                            " as tickets have already been purchased");
        }

        // EventType
        EventType oldEventType = event.getEventType();
        EventType newEventType = request.getEventType();

        // Event
        if (request.getName() != null) {
            event.setName(request.getName());
            String newSlug = toSlug(request.getName()) + "-" + event.getEventId();
            event.setSlug(newSlug);
        }
        if (request.getSummary() != null)
            event.setSummary(request.getSummary());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (file != null) {
            try {
                // Lấy public_id từ imageUrl hiện tại (nếu có)
                String oldPublicId = event.getImageUrl() != null
                        ? cloudinaryService.extractPublicId(event.getImageUrl())
                        : null;
                // Upload ảnh mới và xóa ảnh cũ (nếu có)
                String newImageUrl = cloudinaryService.updateImage(file, oldPublicId);
                event.setImageUrl(newImageUrl);
            } catch (IOException e) {
                throw new AppException(ErrorCode.UPLOAD_IMAGE_FAILED);
            }
        }
        if (request.getCapacity() > 0)
            event.setCapacity(request.getCapacity());
        if (request.getEventType() != null)
            event.setEventType(request.getEventType());

        eventRepository.save(event);

        // Location
        // EventLocationRequest eventLocationRequest = request.getEventLocationRequest();
        // EventLocation location = event.getEventLocation();

        if (eventLocationRequest != null) {
            if (location == null) {
                location = new EventLocation();
                location.setEvent(event);
            }
            if (eventLocationRequest.getAddress() != null)
                location.setAddress(eventLocationRequest.getAddress());
            if (eventLocationRequest.getCity() != null)
                location.setCity(eventLocationRequest.getCity());
            if (eventLocationRequest.getCountry() != null)
                location.setCountry(eventLocationRequest.getCountry());
            if (eventLocationRequest.getPostalCode() != null)
                location.setPostalCode(eventLocationRequest.getPostalCode());
            eventLocationRepository.save(location);
        }

        // Schedule

        log.info("newEventType: {}", newEventType);
        log.info("oldEventType: {}", oldEventType);

        if (oldEventType != newEventType) {
            // Recurring -> Single
            if (newEventType == EventType.SINGLE) {
                if (request.getEventDate() == null || request.getStartTime() == null
                        || request.getEndTime() == null) {
                    throw new AppException(ErrorCode.DATE_TIME_IS_NULL);
                }

                List<EventSchedule> scheduleToDelete = event.getSchedules();

                // delete schedule in event entity
                event.getSchedules().removeAll(scheduleToDelete);

                // delete schedule in DB
                eventScheduleRepository.deleteAll(scheduleToDelete);

                EventSchedule eventSchedule = EventSchedule.builder()
                        .event(event)
                        .scheduleDate(request.getEventDate())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .isDisbursed(false)
                        .build();

                eventScheduleRepository.save(eventSchedule);
            }
            // Single -> Recurring
            else {
                EventSchedule scheduleToDelete = event.getSchedules().get(0);
                log.info("Deleting schedule ID: {}", scheduleToDelete.getScheduleId());

                // delete schedule in event entity
                event.getSchedules().remove(scheduleToDelete);

                // delete schedule in DB
                eventScheduleRepository.delete(scheduleToDelete);
            }
        }
        // Single -> Single => maybe change date or time
        else {
            log.info("bang nhau ne");

            if (newEventType == EventType.SINGLE) {
                if (request.getEventDate() == null || request.getStartTime() == null
                        || request.getEndTime() == null) {
                    throw new AppException(ErrorCode.DATE_TIME_IS_NULL);
                }
                EventSchedule eventSchedule = event.getSchedules().get(0);

                // Check for schedule changes
                boolean scheduleChanged = false;
                if (!request.getEventDate().equals(eventSchedule.getScheduleDate()) ||
                        !request.getStartTime().equals(eventSchedule.getStartTime()) ||
                        !request.getEndTime().equals(eventSchedule.getEndTime())) {
                    scheduleChanged = true;
                }
                //Prevent updating schedule if tickets are sold
                if (hasSoldTickets && scheduleChanged) {
                    throw new IllegalArgumentException(
                            "Cannot update schedule for event " + event.getName() +
                                    " as tickets have been purchased");
                }
                eventSchedule.setScheduleDate(request.getEventDate());
                eventSchedule.setStartTime(request.getStartTime());
                eventSchedule.setEndTime(request.getEndTime());

                eventScheduleRepository.save(eventSchedule);
            }
        }

        // FAQ
        List<FAQRequest> faqRequests = request.getFaqs(); // new faqs
        List<FAQ> faqs = event.getFaqs(); // faqs in DB
        // add faqs <=> faqRequest.id == null (not existing in DB)
        // update faqs <=> faqRequest.id != null and existing in DB
        // delete faqs <=> existing in DB but not in faqsRequest

        if (faqRequests != null && !faqRequests.isEmpty()) {
            for (FAQRequest faqRequest : faqRequests) {
                // add faqs
                if (faqRequest.getId() == null) {
                    FAQ faq = FAQ.builder()
                            .event(event)
                            .answer(faqRequest.getAnswer())
                            .question(faqRequest.getQuestion())
                            .build();

                    faqRepository.save(faq);
                }
                // update faqs
                else {
                    FAQ faq = faqs.stream()
                            .filter(f -> f.getId() == faqRequest.getId())
                            .findFirst()
                            .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

                    if (faqRequest.getAnswer() != null)
                        faq.setAnswer(faqRequest.getAnswer());
                    if (faqRequest.getQuestion() != null)
                        faq.setQuestion(faqRequest.getQuestion());

                }
            }

            // delete faqs
            List<Long> faqRequestIds = faqRequests.stream()
                    .filter(faqRequest -> faqRequest.getId() != null)
                    .map(faqRequest -> faqRequest.getId())
                    .collect(Collectors.toList());

            List<FAQ> faqsToDelete = faqs.stream()
                    .filter(faq -> !faqRequestIds.contains(faq.getId()))
                    .collect(Collectors.toList());

            for (FAQ faq : faqsToDelete) {
                event.getFaqs().remove(faq);
                faqRepository.delete(faq);
            }
        }

        return eventMapper.toEventResponse(event);
    }

    // @Override
    // public List<EventByUserResponse> getEventsByUser() {
    // User user = authenticationService.getUserFromToken();
    // List<Event> events = eventRepository.findAllByUser(user);

    // if (events == null || events.isEmpty()) {
    // return Collections.emptyList();
    // }

    // List<EventByUserResponse> responseList =
    // eventMapper.toEventByUserResponseList(events);
    // for (EventByUserResponse response : responseList) {
    // Integer totalTicketsSold =
    // eventRepository.getTotalTicketsSold(response.getEventId());
    // response.setTotalTicketsSold(totalTicketsSold);
    // }

    // return responseList;
    // }

    @Override
    public Page<EventByUserResponse> getEventsByUser(String timeFilter, Pageable pageable) {
        User user = authenticationService.getUserFromToken();
        String newTimeFilter = (timeFilter == null || timeFilter.trim().isEmpty()) ? "all" : timeFilter.toLowerCase();
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        List<Event> allEvents = eventRepository.findAllByUser(user);
        log.info("User {}: Found {} total events", user.getUserId(), allEvents.size());

        List<Event> filteredEvents = allEvents.stream()
                .filter(event -> {
                    if (event.getSchedules() == null || event.getSchedules().isEmpty()) {
                        return "upcoming".equals(newTimeFilter) || "all".equals(newTimeFilter);
                    }
                    List<LocalDateTime> eventTimes = event.getSchedules().stream()
                            .filter(s -> s.getScheduleDate() != null && s.getStartTime() != null)
                            .map(s -> s.getScheduleDate().atTime(s.getStartTime()))
                            .collect(Collectors.toList());
                    if (eventTimes.isEmpty()) {
                        return "upcoming".equals(newTimeFilter) || "all".equals(newTimeFilter);
                    }

                    if ("upcoming".equals(newTimeFilter)) {
                        return eventTimes.stream().anyMatch(time -> time.isAfter(now));
                    } else if ("past".equals(newTimeFilter)) {
                        return eventTimes.stream().allMatch(time -> time.isBefore(now));
                    } else {
                        return true;
                    }
                })
                .collect(Collectors.toList());
        log.info("User {}: Filtered {} events for timeFilter {}", user.getUserId(), filteredEvents.size(), newTimeFilter);

        int pageSize = pageable.getPageSize();
        int pageNumber = pageable.getPageNumber();
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, filteredEvents.size());
        List<Event> pagedEvents = filteredEvents.subList(start, end);

        List<EventByUserResponse> responses = pagedEvents.stream()
                .map(event -> {
                    int totalTicketsSold = eventRepository.getTotalTicketsSold(event.getEventId());
                    EventByUserResponse response = eventMapper.toEventByUserResponse(event);
                    response.setTotalTicketsSold(totalTicketsSold);
                    return response;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, filteredEvents.size());
    }

    @Override
    public EventByUserResponse getEventByUser() {
        User user = authenticationService.getUserFromToken();
        Event event = eventRepository.findByUser(user);
        if (event == null)
            return null;
        int totalTicketsSold = eventRepository.getTotalTicketsSold(event.getEventId());

        EventByUserResponse eventByUserResponse = eventMapper.toEventByUserResponse(event);
        eventByUserResponse.setTotalTicketsSold(totalTicketsSold);
        return eventByUserResponse;
    }

    @Override
    public EventStatusResponse getEventStatus(Long eventId) {
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!user.getUserId().equals(event.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        boolean hasEvent = true;
        boolean hasSchedule = eventScheduleRepository.existsByEventId(eventId);
        boolean hasTicket = ticketRepository.existsByEventId(eventId);

        return EventStatusResponse.builder()
                .hasEvent(hasEvent)
                .hasSchedule(hasSchedule)
                .hasTicket(hasTicket)
                .build();
    }

    @Override
    public void publishEvent(Long eventId) {
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!user.getUserId().equals(event.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getIsPublished().equals(true)) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        event.setIsPublished(true);
        event.setPublishedAt(LocalDateTime.now());
        eventRepository.save(event);

        notificationService.notifyFollowersOnEventCreation(eventId, user.getUserId());
    }

    @Override
    public void unpublishEvent(Long eventId) {
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!user.getUserId().equals(event.getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (event.getIsPublished().equals(false)) {
            throw new AppException(ErrorCode.EVENT_ALREADY_UNPUBLISHED);
        }

        event.setIsPublished(false);
        event.setPublishedAt(null);
        eventRepository.save(event);
    }

    public String toSlug(String input) {
        String slug = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        return slug;
    }

    @Override
    public Page<EventSearchResponse> searchByName(String keyword, String location, boolean isFree, LocalDate startDate,
            LocalDate endDate, String eventStatus, Pageable pageable) {
        Page<Event> events = eventRepository.searchByName(keyword, location, isFree, startDate, endDate, eventStatus,
                pageable); // Thêm eventStatus
        return events.map(eventMapper::toEventSearchResponse);
    }

    @Override
    public List<CategoryAndThemeResponse> getCategoryAndTheme() {
        List<CategoryAndThemeResponse> categorysAndThemes = new ArrayList<>();

        List<EventCategories> categories = eventCategoriesRepository.findAll();
        for (EventCategories category : categories) {
            categorysAndThemes.add(
                    new CategoryAndThemeResponse(category.getCategoryId(), category.getCategoryName(), "category"));
        }

        List<EventThemes> themes = eventThemesRepository.findAll();
        for (EventThemes theme : themes) {
            categorysAndThemes.add(new CategoryAndThemeResponse(theme.getThemeId(), theme.getThemeName(), "theme"));
        }

        return categorysAndThemes;
    }

    @Override
    @Transactional
    public void addCategoryAndTheme(Long eventId, Long categoryId, Long themeId) {
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        // check user have permission ? (authorized?)
        if (user.getUserId() != event.getUser().getUserId()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        EventCategories eventCategories = eventCategoriesRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        EventThemes eventThemes = eventThemesRepository.findById(themeId)
                .orElseThrow(() -> new AppException(ErrorCode.THEME_NOT_FOUND));

        event.setCategory(eventCategories);
        event.setTheme(eventThemes);
        eventRepository.save(event);
    }

    @Override
    public List<EventHomepageResponse> getTrendingEvents() {
        List<Object[]> results = eventRepository.findTrendingEvents();
        return results.stream()
                .map(row -> EventHomepageResponse.builder()
                        .eventId(((Number) row[0]).longValue())
                        .name((String) row[1])
                        .imageUrl((String) row[2])
                        .slug((String) row[3])
                        .scheduleDate(row[4] != null ? LocalDate.parse(row[4].toString()) : null)
                        .soldTickets(((Number) row[5]).longValue())
                        .minPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<EventHomepageResponse> getRandomEvents() {
        List<Object[]> results = eventRepository.findRandomEvents();
        Collections.shuffle(results);
        return results.stream()
                .limit(20)
                .map(row -> EventHomepageResponse.builder()
                        .eventId(((Number) row[0]).longValue())
                        .name((String) row[1])
                        .imageUrl((String) row[2])
                        .slug((String) row[3])
                        .scheduleDate(row[4] != null ? LocalDate.parse(row[4].toString()) : null)
                        .soldTickets(((Number) row[5]).longValue())
                        .minPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<EventHomepageResponse> getEventsByDateRange(String period) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        if ("weekend".equalsIgnoreCase(period)) {
            startDate = now.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.FRIDAY));
            endDate = startDate.plusDays(2);
        } else if ("month".equalsIgnoreCase(period)) {
            startDate = now.with(TemporalAdjusters.firstDayOfMonth());
            endDate = now.with(TemporalAdjusters.lastDayOfMonth());
        } else {
            throw new IllegalArgumentException("Period must be 'weekend' or 'month'");
        }

        List<Object[]> results = eventRepository.findEventsByDateRange(startDate, endDate);
        return results.stream()
                .map(row -> EventHomepageResponse.builder()
                        .eventId(((Number) row[0]).longValue())
                        .name((String) row[1])
                        .imageUrl((String) row[2])
                        .slug((String) row[3])
                        .scheduleDate(row[4] != null ? LocalDate.parse(row[4].toString()) : null)
                        .soldTickets(((Number) row[5]).longValue())
                        .minPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getEventSummary() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalEvents", eventRepository.count());
        result.put("completedEvents", eventRepository.countCompletedEvents());
        result.put("upcomingEvents", eventRepository.countUpcomingEvents());
        result.put("ticketSales", eventRepository.getTotalTicketSales());

        return result;
    }

    @Override
    public List<ThemeEventCountResponse> countEventsByTheme() {
        return eventThemesRepository.countEventsByTheme();
    }

    @Override
    public Page<EventInAdminResponse> getFilteredEvents(String status, String sort, Pageable pageable) {
        if (status == null) {
            return eventRepository.findAllOrderByTicketSalesDesc(pageable);
        } else if ("date_desc".equals(sort)) {
            return eventRepository.findEventsByStatusOrderByCreatedAtDesc(status, pageable);
        } else if ("tickets".equals(sort)) {
            return eventRepository.findEventsByStatusOrderByTicketSalesDesc(status, pageable);
        } else {
            return eventRepository.findEventsByStatus(status, pageable);
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void hiddenEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        if (event.getIsSuspended() == true) {
            throw new AppException(ErrorCode.EVENT_ALREADY_HIDDEN);
        }
        event.setIsSuspended(true);
        eventRepository.save(event);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void unhiddenEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        if (event.getIsSuspended() == false) {
            throw new AppException(ErrorCode.EVENT_ALREADY_VISIBLE);
        }
        event.setIsSuspended(false);
        eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        // check user have permission ? (authorized?)
        User user = authenticationService.getUserFromToken();
        if (user.getUserId() != event.getUser().getUserId()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if any ticket for this event has sold tickets
        List<EventSchedule> schedules = eventScheduleRepository.findAllByEvent(event);
        for (EventSchedule schedule : schedules) {
            List<TicketSchedule> ticketSchedules = ticketScheduleRepository.findBySchedule(schedule);
            for (TicketSchedule ticketSchedule : ticketSchedules) {
                if (ticketSchedule.getSold() > 0) {
                    LocalDate date = schedule.getScheduleDate();
                    LocalTime time = schedule.getStartTime();
                    throw new IllegalArgumentException(
                            "This event has tickets that have already been sold for the schedule on "
                                    + date + " starting at " + time + ".");
                }
            }
        }

        eventRepository.delete(event);
    }
}
