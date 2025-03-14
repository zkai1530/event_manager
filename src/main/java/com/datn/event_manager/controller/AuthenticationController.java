package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/authenticate")
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping
    public ResponseEntity<APIResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(new APIResponse("authenticate", authenticationService.authenticate(request)));
    }
}
