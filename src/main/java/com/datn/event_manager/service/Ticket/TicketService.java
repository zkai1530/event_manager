package com.datn.event_manager.service.Ticket;

import java.util.List;

import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.dto.response.TicketResponse;

public interface TicketService {
    public void createTicket(TicketRequest request);

    public void updateTicket(Long ticketId, TicketRequest request);

    public void deleteTicket(Long ticketId);

    public List<TicketResponse> viewAllTicketByEventId(Long eventId);

    public TicketResponse viewTicketById(Long ticketId);
}
