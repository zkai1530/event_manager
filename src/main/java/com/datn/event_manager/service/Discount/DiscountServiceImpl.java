package com.datn.event_manager.service.Discount;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.request.DiscountRequest;
import com.datn.event_manager.dto.response.DiscountResponse;
import com.datn.event_manager.entity.Discount;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.Ticket;
import com.datn.event_manager.entity.TicketDiscount;
import com.datn.event_manager.entity.TicketSchedule;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.enums.DiscountType;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.DiscountMapper;
import com.datn.event_manager.repository.DiscountRepository;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountServiceImpl implements DiscountService {
    AuthenticationService authenticationService;
    DiscountRepository discountRepository;
    TicketRepository ticketRepository;
    EventRepository eventRepository;
    DiscountMapper discountMapper;

    @Override
    public void createDiscount(DiscountRequest request) {
        User user = authenticationService.getUserFromToken();

        List<Ticket> tickets = ticketRepository.findAllById(request.getTicketIds());

        if (tickets.size() != request.getTicketIds().size()) {
            throw new IllegalArgumentException("One or many tickets invalid!");
        }

        // Check if the user is the owner of the event
        for (Ticket ticket : tickets) {
            for (TicketSchedule ticketSchedule : ticket.getTicketSchedules()) {
                String eventOwnerId = ticketSchedule.getSchedule().getEvent().getUser().getUserId();

                if (!eventOwnerId.equals(user.getUserId())) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
            }
        }

        // check if the discount type is percent 
        if (request.getDiscountType() == DiscountType.PERCENT && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Discount value must be less than or equal to 100%");
        }

        // check if the discount value is FIXED 
        if (request.getDiscountType() == DiscountType.FIXED) {
            if (request.getDiscountValue().compareTo(BigDecimal.ZERO) < 0 ) {
                throw new IllegalArgumentException("Discount value must be greater than or equal to 0 ");
            }
            else {
                for (Ticket ticket : tickets) {
                    if (request.getDiscountValue().compareTo(ticket.getPrice()) > 0) {
                        throw new IllegalArgumentException("Discount value must be less than or equal to ticket price");
                    }
                }
            }
        }

        // check if the discount start time is before the end time 
        if (request.getDiscountStart() != null && request.getDiscountEnd() != null) {
            if (request.getDiscountStart().isAfter(request.getDiscountEnd())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }

            if (request.getDiscountStart().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }
        }

        for (Ticket ticket : tickets) {
            LocalDateTime saleEnd = ticket.getSaleEnd();
            if (request.getDiscountEnd() != null && saleEnd != null && !request.getDiscountEnd().isBefore(saleEnd)
                    && !request.getDiscountEnd().isEqual(saleEnd)) {
                throw new IllegalArgumentException(
                        "Discount end time is invalid for ticket " + ticket.getTicketId() + " with sale end at "
                                + saleEnd);
            }
        }

        log.info("type" + request.getDiscountType());
        // add discount to ticket 
        Discount discount = Discount.builder()
                .name(request.getName())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .promoCode(request.getPromoCode())
                .discountStart(request.getDiscountStart())
                .discountEnd(request.getDiscountEnd())
                .maxUses(request.getMaxUses())
                .timesUsed(0)
                .createdAt(LocalDateTime.now())
                .build();

        List<TicketDiscount> ticketDiscounts = tickets.stream()
                .map(ticket -> TicketDiscount.builder()
                        .ticket(ticket)
                        .discount(discount)
                        .build())
                .toList();
                
        discount.setTicketDiscounts(ticketDiscounts);
        discountRepository.save(discount);
    }

    @Override
    public DiscountResponse updateDiscount(Long discountId, DiscountRequest request) {
        User user = authenticationService.getUserFromToken();

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        List<Ticket> ticketsRequest = ticketRepository.findAllById(request.getTicketIds());

        if (ticketsRequest.size() != request.getTicketIds().size()) {
            throw new IllegalArgumentException("One or many tickets invalid!");
        }

        // Check if the user is the owner of the event
        for (Ticket ticket : ticketsRequest) {
            for (TicketSchedule ticketSchedule : ticket.getTicketSchedules()) {
                String eventOwnerId = ticketSchedule.getSchedule().getEvent().getUser().getUserId();

                if (!eventOwnerId.equals(user.getUserId())) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
            }
        }

        // check if the event is published, can't edit information
        if (discount.getTicketDiscounts().get(0).getTicket().getTicketSchedules().get(0).getSchedule().getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        if (request.getDiscountStart() != null && request.getDiscountEnd() != null) {
            if (request.getDiscountStart().isAfter(request.getDiscountEnd())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }

            if (request.getDiscountStart().isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.INVALID_SALE_DATES);
            }
        }

        if (request.getDiscountEnd() != null) {
            for (Ticket ticket : ticketsRequest) {
                LocalDateTime saleEnd = ticket.getSaleEnd();
                if (saleEnd != null && !request.getDiscountEnd().isBefore(saleEnd)
                        && !request.getDiscountEnd().isEqual(saleEnd)) {
                    throw new IllegalArgumentException(
                            "Discount end time is invalid for ticket " + ticket.getTicketId() + " with sale end at "
                                    + saleEnd);
                }
            }
        }

        // update Discount 

        // todo: update normal field
        if (request.getName() != null)
            discount.setName(request.getName());
        discount.setPromoCode(request.getPromoCode());
        if (request.getDiscountType() != null)
            discount.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null)
            discount.setDiscountValue(request.getDiscountValue());
        if (request.getMaxUses() != null)
            discount.setMaxUses(request.getMaxUses());
        if (request.getDiscountStart() != null)
            discount.setDiscountStart(request.getDiscountStart());
        if (request.getDiscountEnd() != null)
            discount.setDiscountEnd(request.getDiscountEnd());

        // update ticketIds

        // todo: take current tickets. Example: 1, 2
        List<TicketDiscount> currentTicketDiscounts = discount.getTicketDiscounts();

        Set<Long> currentTicketIds = currentTicketDiscounts.stream()
            .map(td -> td.getTicket().getTicketId())
            .collect(Collectors.toSet());

        // todo: take ids of tickets in request. Example: 2, 3
        Set<Long> requestTicketIds = ticketsRequest.stream()
                .map(Ticket::getTicketId)
                .collect(Collectors.toSet());
        
        // todo: remove tickets that are not in request. Example: 1
        currentTicketDiscounts.removeIf(ticketDiscount -> {
            Long ticketId = ticketDiscount.getTicket().getTicketId();
            return !requestTicketIds.contains(ticketId);
        });

        // todo: add new tickets that are not in current. Example: 3
        if (!currentTicketIds.equals(requestTicketIds)) {
            for (Ticket ticket : ticketsRequest) {
                Long ticketId = ticket.getTicketId();
                // check if exist (example: 2) => no change
                boolean isTicketExist = currentTicketDiscounts.stream()
                        .anyMatch(currentTicketDiscount -> currentTicketDiscount.getTicket().getTicketId().equals(ticketId));

                if (!isTicketExist) {
                    TicketDiscount ticketDiscount = TicketDiscount.builder()
                            .ticket(ticket)
                            .discount(discount)
                            .build();

                    currentTicketDiscounts.add(ticketDiscount);
                }
            }
            discount.setTicketDiscounts(currentTicketDiscounts);
        }
        discountRepository.save(discount);

        return discountMapper.toDiscountResponse(discount);
    }    

    @Override
    public List<DiscountResponse> viewAllDiscountByEventId(Long eventId) {
        // check user is the owner of the event
        User user = authenticationService.getUserFromToken();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));

        if (!event.getUser().getUserId().equals(user.getUserId()))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        // view all discount
        List<Discount> discounts = discountRepository.findDiscountsByEventId(eventId);
        return discountMapper.toDiscountResponseList(discounts);
    }

    @Override
    public void deleteDiscount(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));

        discountRepository.delete(discount);
    }

    @Override
    public DiscountResponse viewDiscountById(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new AppException(ErrorCode.DISCOUNT_NOT_FOUND));
        return discountMapper.toDiscountResponse(discount);
    }

}
