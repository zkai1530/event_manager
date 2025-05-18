package com.datn.event_manager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.BankAccountRequest;
import com.datn.event_manager.dto.request.ComplaintRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Complaint.ComplaintService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/complaint")
public class ComplaintController {
    ComplaintService complaintService;

    @NonFinal
    @Value("${list-complaint}")
    int LIST_COMPLAINT;

    @PostMapping
    public ResponseEntity<APIResponse> complaint(@RequestBody ComplaintRequest request) throws Exception {
        complaintService.complaint(request);
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, null));
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse> getAllComplaint(@RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, LIST_COMPLAINT);
        return ResponseEntity
                .ok(new APIResponse(Message.RESOURCE_FOUND, complaintService.getAllComplaint(pageable)));
    }
}
