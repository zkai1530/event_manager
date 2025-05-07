package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.BankAccountRequest;
import com.datn.event_manager.dto.request.ComplaintRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Complaint.ComplaintService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/complaint")
public class ComplaintController {
    ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<APIResponse> complaint(@RequestBody ComplaintRequest request) throws Exception {
        complaintService.complaint(request);
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, null));
    }

}
