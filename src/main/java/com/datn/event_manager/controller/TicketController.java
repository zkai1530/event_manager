package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.TicketRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.repository.TicketRepository;
import com.datn.event_manager.service.Ticket.TicketService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/ticket")
public class TicketController {
    TicketService ticketService;

    @PostMapping
    public ResponseEntity<APIResponse> createTicket(@RequestBody TicketRequest request) {
        ticketService.createTicket(request);
        return ResponseEntity.ok(new APIResponse(Message.CREATE_TICKET_SUCCESS, null));
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<APIResponse> updateTicket(@PathVariable Long ticketId, @RequestBody TicketRequest request) {
        ticketService.updateTicket(ticketId, request);
        return ResponseEntity.ok(new APIResponse(Message.UPDATE_TICKET_SUCCESS, null));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<APIResponse> deleteTicket(@PathVariable Long ticketId) {
        ticketService.deleteTicket(ticketId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_TICKET_SUCCESS, null));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<APIResponse> viewTicketById(@PathVariable Long ticketId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, ticketService.viewTicketById(ticketId)));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<APIResponse> viewAllTicketByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, ticketService.viewAllTicketByEventId(eventId)));
    }

}
