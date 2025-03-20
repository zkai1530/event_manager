package com.datn.event_manager.service.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import com.datn.event_manager.configuration.ApplicationInitConfig;
import com.datn.event_manager.controller.UserController;
import com.datn.event_manager.dto.request.EventLocationRequest;
import com.datn.event_manager.dto.request.EventRequest;
import com.datn.event_manager.dto.request.FAQRequest;
import com.datn.event_manager.dto.response.EventResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventLocation;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.FAQ;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.enums.EventType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.EventMapper;
import com.datn.event_manager.repository.*;
import com.datn.event_manager.service.Authentication.AuthenticationService;

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
    EventMapper eventMapper;
    FAQRepository faqRepository;
    AuthenticationService authenticationService;

    @Override
    public String createEvent(EventRequest eventRequest) {
        User user = authenticationService.getUserFromUser();
        Event event = Event.builder()
                .user(user)
                .name(eventRequest.getName())
                .summary(eventRequest.getSummary())
                .description(eventRequest.getDescription())
                .imageUrl(eventRequest.getImageUrl())
                .capacity(eventRequest.getCapacity())
                .eventType(eventRequest.getEventType())
                .isPublished(false)
                .createdAt(LocalDateTime.now())
                .build();
        eventRepository.save(event);

        // Location
        if (eventRequest.getEventLocationRequest() != null) {
            EventLocationRequest eventLocationRequest = eventRequest.getEventLocationRequest();

            EventLocation location = event.getEventLocation();

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

            EventSchedule eventSchedule = EventSchedule.builder()
                    .event(event)
                    .scheduleDate(eventRequest.getEventDate())
                    .startTime(eventRequest.getStartTime())
                    .endTime(eventRequest.getEndTime())
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
        return "ok me";
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
        return eventMapper.toEventResponse(event);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
        // check user have permission ? (authorized?)
        User user = authenticationService.getUserFromUser();
        if (user.getUserId() != event.getUser().getUserId()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // EventType
        EventType oldEventType = event.getEventType();
        EventType newEventType = request.getEventType();

        // Event
        if (request.getName() != null)
            event.setName(request.getName());
        if (request.getSummary() != null)
            event.setSummary(request.getSummary());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (request.getImageUrl() != null)
            event.setImageUrl(request.getImageUrl());
        if (request.getCapacity() > 0)
            event.setCapacity(request.getCapacity());
        if (request.getEventType() != null)
            event.setEventType(request.getEventType());

        eventRepository.save(event);

        // Location
        EventLocationRequest eventLocationRequest = request.getEventLocationRequest();
        EventLocation location = event.getEventLocation();

        if (eventLocationRequest != null) {
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

                EventSchedule eventSchedule = EventSchedule.builder()
                        .event(event)
                        .scheduleDate(request.getEventDate())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
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

                if (request.getEventDate() != null)
                    eventSchedule.setScheduleDate(request.getEventDate());
                if (request.getStartTime() != null)
                    eventSchedule.setStartTime(request.getStartTime());
                if (request.getEndTime() != null)
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
                faqRepository.delete(faq);
            }
        }

        return eventMapper.toEventResponse(event);
    }

}
