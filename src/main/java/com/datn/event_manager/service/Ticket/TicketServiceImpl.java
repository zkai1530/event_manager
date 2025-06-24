package com.datn.event_manager.service.Ticket;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.dto.response.TicketResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Section;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.VenueMap;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.TicketMapper;
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
public class TicketServiceImpl implements TicketService {
    TicketRepository ticketRepository;
    TicketScheduleRepository ticketScheduleRepository;
    SectionRepository sectionRepository;
    EventScheduleRepository scheduleRepository;
    EventRepository eventRepository;
    AuthenticationService authenticationService;
    TicketMapper ticketMapper;

    @Override
    public void createTicket(TicketRequest request) {
        User user = authenticationService.getUserFromToken();

        List<EventSchedule> schedules = scheduleRepository.findAllById(request.getScheduleIds());

        if (schedules.size() != request.getScheduleIds().size()) {
            throw new IllegalArgumentException("One or many schedules invalid!");
        }

        // Check if saleStart is before the earliest schedule start
        if (request.getSaleStart() != null) {
            LocalDateTime minScheduleStart = schedules.stream()
                    .map(schedule -> LocalDateTime.of(schedule.getScheduleDate(), schedule.getStartTime()))
                    .min(LocalDateTime::compareTo)
                    .orElseThrow(() -> new IllegalArgumentException("No schedules provided"));

            if (!request.getSaleStart().isBefore(minScheduleStart)) {
                throw new IllegalArgumentException(
                        "Sale start time is invalid for schedule on " + minScheduleStart.toLocalDate() +
                                " starting at " + minScheduleStart.toLocalTime());
            }
        }

        // Check if the user is the owner of the event
        Event event = null;
        for (EventSchedule schedule : schedules) {
            String eventOwnerId = schedule.getEvent().getUser().getUserId();

            if (!eventOwnerId.equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            // check if the event is published, can't add information
            if (schedule.getEvent().getIsPublished()) {
                throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
            }

            event = schedule.getEvent();
        }

        // calc availableQuantity and check sections if provided
        Integer availableQuantity;
        List<Section> sections = new ArrayList<>();
        if (request.getSectionIds() != null && !request.getSectionIds().isEmpty()) {
            if (event == null || !Boolean.TRUE.equals(event.getHasSeatMap())) {
                throw new IllegalArgumentException("Event does not have a seat map!");
            }

            sections = sectionRepository.findAllById(request.getSectionIds());
            if (sections.size() != request.getSectionIds().size()) {
                throw new IllegalArgumentException("One or many sections invalid!");
            }

            VenueMap venueMap = event.getVenueMap();
            if (venueMap == null) {
                throw new IllegalArgumentException("No venue map found for this event!");
            }
            for (Section section : sections) {
                if (!section.getVenueMap().getVenueMapId().equals(venueMap.getVenueMapId())) {
                    throw new IllegalArgumentException("Section does not belong to this event's venue map!");
                }

                if (section.getTicket() != null) {
                    throw new IllegalArgumentException(
                            "Section " + section.getName() + " is already assigned to another ticket!");
                }
            }

            availableQuantity = sections.stream()
                    .mapToInt(section -> section.getSeats().size())
                    .sum();

        } else {
            if (request.getAvailableQuantity() == null || request.getAvailableQuantity() <= 0) {
                throw new IllegalArgumentException("Available quantity must be provided and positive!");
            }
            availableQuantity = request.getAvailableQuantity();
        }

        Ticket ticket = Ticket.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .availableQuantity(availableQuantity)
                .sold(0)
                .saleStart(request.getSaleStart())
                .saleEnd(request.getSaleEnd())
                .createdAt(LocalDateTime.now())
                .build();

        List<TicketSchedule> ticketSchedules = schedules.stream()
                .map(schedule -> TicketSchedule.builder()
                        .ticket(ticket)
                        .schedule(schedule)
                        .checkedInCount(0)
                        .reservedQuantity(0)
                        .availableQuantity(availableQuantity)
                        .sold(0)
                        .build())
                .toList();

        ticket.setTicketSchedules(ticketSchedules);

        if (!sections.isEmpty()) {
            sections.forEach(section -> section.setTicket(ticket));
            ticket.setSections(sections);
        }

        ticketRepository.save(ticket);
    }

    @Transactional
    @Override
    public void updateTicket(Long ticketId, TicketRequest request) {
        User user = authenticationService.getUserFromToken();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        List<EventSchedule> schedulesRequest = scheduleRepository.findAllById(request.getScheduleIds());

        log.info(schedulesRequest.stream().map(schedule -> schedule.getScheduleId()).toList().toString());

        if (schedulesRequest.size() != request.getScheduleIds().size()) {
            throw new IllegalArgumentException("One or many schedules invalid!");
        }

        // Check if the user is the owner of the event
        Event event = null;
        for (EventSchedule schedule : schedulesRequest) {
            String eventOwnerId = schedule.getEvent().getUser().getUserId();

            if (!eventOwnerId.equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            event = schedule.getEvent();
        }

        // check if the event is published, can't edit information
        if (ticket.getTicketSchedules().get(0).getSchedule().getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        if (request.getSaleStart() != null && request.getSaleEnd() != null) {
            if (request.getSaleStart().isAfter(request.getSaleEnd())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }

            if (request.getSaleStart().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }
        }

        // if (request.getSaleEnd() != null) {
        // for (EventSchedule schedule : schedulesRequest) {
        // LocalDate scheduleDate = schedule.getScheduleDate();
        // LocalTime startTime = schedule.getStartTime();
        // LocalDateTime scheduleStart = LocalDateTime.of(scheduleDate, startTime);
        // if (!request.getSaleEnd().isBefore(scheduleStart)) {
        // throw new IllegalArgumentException(
        // "Sale end time is invalid for schedule on " + scheduleDate + " starting at "
        // + startTime);
        // }
        // }
        // }

        // Check if saleStart is before the earliest schedule start
        if (request.getSaleStart() != null) {
            // Find the earliest schedule start time
            LocalDateTime minScheduleStart = schedulesRequest.stream()
                    .map(schedule -> LocalDateTime.of(schedule.getScheduleDate(), schedule.getStartTime()))
                    .min(LocalDateTime::compareTo)
                    .orElseThrow(() -> new IllegalArgumentException("No schedules provided"));

            if (!request.getSaleStart().isBefore(minScheduleStart)) {
                throw new IllegalArgumentException(
                        "Sale start time is invalid for schedule on " + minScheduleStart.toLocalDate() + " starting at "
                                + minScheduleStart.toLocalTime());
            }
        }

        Integer availableQuantity = null;
        List<Section> sections = new ArrayList<>();
        if (request.getSectionIds() != null && !request.getSectionIds().isEmpty()) {
            if (event == null || !Boolean.TRUE.equals(event.getHasSeatMap())) {
                throw new IllegalArgumentException("Event does not have a seat map!");
            }

            sections = sectionRepository.findAllById(request.getSectionIds());
            if (sections.size() != request.getSectionIds().size()) {
                throw new IllegalArgumentException("One or many sections invalid!");
            }

            VenueMap venueMap = event.getVenueMap();
            if (venueMap == null) {
                throw new IllegalArgumentException("No venue map found for this event!");
            }
            for (Section section : sections) {
                if (!section.getVenueMap().getVenueMapId().equals(venueMap.getVenueMapId())) {
                    throw new IllegalArgumentException("Section does not belong to this event's venue map!");
                }
            }

            availableQuantity = sections.stream()
                    .mapToInt(section -> section.getSeats().size())
                    .sum();

            for (Section section : sections) {
                if (section.getTicket() != null && !section.getTicket().getTicketId().equals(ticketId)) {
                    throw new IllegalArgumentException(
                            "Section " + section.getName() + " is already assigned to another ticket!");
                }
            }
        } else {
            if (request.getAvailableQuantity() != null) {
                if (request.getAvailableQuantity() <= 0) {
                    throw new IllegalArgumentException("Available quantity must be positive!");
                }
                availableQuantity = request.getAvailableQuantity();
            }
        }

        // update scheduleIds

        // * ticket.getTicketSchedules().clear(); // clear existing schedules

        // * List<TicketSchedule> ticketSchedules = schedules.stream()
        // * .map(schedule -> TicketSchedule.builder()
        // * .ticket(ticket)
        // * .schedule(schedule)
        // * .build())
        // * .collect(Collectors.toList());

        // * ticket.getTicketSchedules().addAll(ticketSchedules); // add new schedules
        // * ticketRepository.save(ticket);

        // todo: take current schedule. Example: 1, 2
        List<TicketSchedule> currentTicketSchedules = ticket.getTicketSchedules();

        Set<Long> currentScheduleIds = currentTicketSchedules.stream()
                .map(td -> td.getSchedule().getScheduleId())
                .collect(Collectors.toSet());

        // todo: take ids of schedules in request. Example: 2, 3
        Set<Long> requestScheduleIds = schedulesRequest.stream()
                .map(EventSchedule::getScheduleId)
                .collect(Collectors.toSet());

        // * Check if any schedule to be removed has sold tickets
        for (TicketSchedule ticketSchedule : currentTicketSchedules) {
            Long scheduleId = ticketSchedule.getSchedule().getScheduleId();
            if (!requestScheduleIds.contains(scheduleId) && ticketSchedule.getSold() > 0) {
                EventSchedule schedule = ticketSchedule.getSchedule();
                LocalDate scheduleDate = schedule.getScheduleDate();
                LocalTime startTime = schedule.getStartTime();
                throw new IllegalArgumentException(
                        "Schedule on " + scheduleDate + " starting at " + startTime +
                                " has already been purchased for ticket " + ticket.getTicketId());
            }
        }

        if (request.getName() != null)
            ticket.setName(request.getName());
        if (request.getDescription() != null)
            ticket.setDescription(request.getDescription());
        if (request.getPrice() != null)
            ticket.setPrice(request.getPrice());
        if (availableQuantity != null)
            ticket.setAvailableQuantity(availableQuantity);
        if (request.getSaleStart() != null)
            ticket.setSaleStart(request.getSaleStart());
        if (request.getSaleEnd() != null)
            ticket.setSaleEnd(request.getSaleEnd());
        ticket.setSold(0);

        if (request.getSectionIds() != null) {
            List<Section> currentSections = ticket.getSections();
            currentSections.forEach(section -> {
                if (!request.getSectionIds().contains(section.getSectionId())) {
                    section.setTicket(null); 
                }
            });
            ticket.getSections().clear(); // Xóa collection cũ
            sections.forEach(section -> {
                section.setTicket(ticket);
                ticket.getSections().add(section); // Thêm section vào collection hiện tại
            });
        }

        // Update availableQuantity for existing TicketSchedules
        if (availableQuantity != null) {
            for (TicketSchedule currentTicketSchedule : currentTicketSchedules) {
                currentTicketSchedule.setAvailableQuantity(availableQuantity);
                // ticketScheduleRepository.save(currentTicketSchedule);
            }

        }

        // todo: return if ticketIds no have change
        if (currentScheduleIds.equals(requestScheduleIds)) {
            ticketRepository.save(ticket);
            return;
        }

        // todo: remove schedules that are not in request. Example: 1
        currentTicketSchedules.removeIf(ticketSchedule -> {
            Long scheduleId = ticketSchedule.getSchedule().getScheduleId();
            return !requestScheduleIds.contains(scheduleId);
        });

        // todo: add new schedules that are not in current. Example: 3
        for (EventSchedule schedule : schedulesRequest) {
            Long scheduleId = schedule.getScheduleId();
            // check if exist (example: 2) => no change
            boolean isScheduleExist = currentTicketSchedules.stream()
                    .anyMatch(currentTicketSchedule -> currentTicketSchedule.getSchedule().getScheduleId()
                            .equals(scheduleId));

            if (!isScheduleExist) {
                TicketSchedule ticketSchedule = TicketSchedule.builder()
                        .ticket(ticket)
                        .schedule(schedule)
                        .availableQuantity(
                                availableQuantity != null ? availableQuantity : ticket.getAvailableQuantity())
                        .sold(0)
                        .checkedInCount(0)
                        .reservedQuantity(0)
                        .build();
                currentTicketSchedules.add(ticketSchedule);
            }
        }
        ticket.setTicketSchedules(currentTicketSchedules);

        ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long ticketId) {
        User user = authenticationService.getUserFromToken();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        // Check if the user is the owner of the event
        if (!ticket.getTicketSchedules().get(0).getSchedule().getEvent().getUser().getUserId()
                .equals(user.getUserId())) {
            {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        // check if the event is published, can't edit information
        if (ticket.getTicketSchedules().get(0).getSchedule().getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Check if any schedule of this ticket has sold tickets
        for (TicketSchedule ticketSchedule : ticket.getTicketSchedules()) {
            if (ticketSchedule.getSold() > 0) {
                LocalDate date = ticketSchedule.getSchedule().getScheduleDate();
                LocalTime time = ticketSchedule.getSchedule().getStartTime();
                throw new IllegalArgumentException(
                        "Schedule on " + date + " starting at " + time +
                                " has already been purchased for ticket " + ticket.getTicketId());
            }
        }

        if (!ticket.getSections().isEmpty()) {
            ticket.getSections().forEach(section -> section.setTicket(null));
        }

        ticketRepository.delete(ticket);
    }

    @Override
    public List<TicketResponse> viewAllTicketByEventId(Long eventId) {
        // check user is the owner of the event
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!event.getUser().getUserId().equals(user.getUserId()))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        List<Ticket> tickets = ticketRepository.findTicketsByEventId(eventId);

        return ticketMapper.toTicketResponseList(tickets);
    }

    @Override
    public TicketResponse viewTicketById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        return ticketMapper.toTicketResponse(ticket);
    }
}
