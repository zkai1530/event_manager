package com.datn.event_manager.service.Ticket;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.dto.response.TicketResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.EventSchedule;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
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

        // Check if the user is the owner of the event
        for (EventSchedule schedule : schedules) {
            String eventOwnerId = schedule.getEvent().getUser().getUserId();

            if (!eventOwnerId.equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        Ticket ticket = Ticket.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .availableQuantity(request.getAvailableQuantity())
                .sold(0)
                .saleStart(request.getSaleStart())
                .saleEnd(request.getSaleEnd())
                .createdAt(LocalDateTime.now())
                .build();

        List<TicketSchedule> ticketSchedules = schedules.stream()
                .map(schedule -> TicketSchedule.builder()
                        .ticket(ticket)
                        .schedule(schedule)
                        .build())
                .toList();

        ticket.setTicketSchedules(ticketSchedules);
        ticketRepository.save(ticket);
    }

    @Transactional
    @Override
    public void updateTicket(Long ticketId, TicketRequest request) {
        User user = authenticationService.getUserFromToken();

        List<EventSchedule> schedulesRequest = scheduleRepository.findAllById(request.getScheduleIds());

        log.info(schedulesRequest.stream().map(schedule -> schedule.getScheduleId()).toList().toString());

        if (schedulesRequest.size() != request.getScheduleIds().size()) {
            throw new IllegalArgumentException("One or many schedules invalid!");
        }

        // Check if the user is the owner of the event
        for (EventSchedule schedule : schedulesRequest) {
            String eventOwnerId = schedule.getEvent().getUser().getUserId();

            if (!eventOwnerId.equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        if (request.getSaleStart() != null && request.getSaleEnd() != null) {
            if (request.getSaleStart().isAfter(request.getSaleEnd())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }

            if (request.getSaleStart().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        if (request.getName() != null)
            ticket.setName(request.getName());
        if (request.getDescription() != null)
            ticket.setDescription(request.getDescription());
        if (request.getPrice() != null)
            ticket.setPrice(request.getPrice());
        if (request.getAvailableQuantity() != null)
            ticket.setAvailableQuantity(request.getAvailableQuantity());
        if (request.getSaleStart() != null)
            ticket.setSaleStart(request.getSaleStart());
        if (request.getSaleStart() != null)
            ticket.setSaleStart(request.getSaleStart());
        if (request.getSaleEnd() != null)
            ticket.setSaleEnd(request.getSaleEnd());

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

        // todo: return if ticketIds no have change
        if (currentScheduleIds.equals(requestScheduleIds)) {
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
                    .anyMatch(currentTicketSchedule -> currentTicketSchedule.getSchedule().getScheduleId().equals(scheduleId));

            if (!isScheduleExist) {
                TicketSchedule ticketSchedule = TicketSchedule.builder()
                        .ticket(ticket)
                        .schedule(schedule)
                        .build();
                currentTicketSchedules.add(ticketSchedule);
            }
        }
        ticket.setTicketSchedules(currentTicketSchedules);
        ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

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
