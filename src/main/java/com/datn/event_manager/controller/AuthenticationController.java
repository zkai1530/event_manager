package com.datn.event_manager.controller;

import java.text.ParseException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.LogoutRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.AuthenticationResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/auth")
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<APIResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.LOGIN_SUCCESS, authenticationService.authenticate(request)));
    }

    
    @PostMapping("/google")
    public ResponseEntity<APIResponse> loginWithGoogle(@RequestParam("code") String code) {
        return ResponseEntity.ok(new APIResponse("Login success", authenticationService.loginWithGoogle(code)));
    }

    @PostMapping("/logout")
    public ResponseEntity<APIResponse> logout(@RequestBody LogoutRequest request) throws JOSEException, ParseException {
        authenticationService.logout(request);
        return ResponseEntity.ok(new APIResponse(Message.LOGOUT_SUCCESS, null));
    }

    @PostMapping("/introspect")
    public ResponseEntity<APIResponse> introspect(@RequestBody AuthenticationResponse request) 
            throws JOSEException, ParseException{
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, authenticationService.introspect(request.getToken())));
    }
}
