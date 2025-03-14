package com.datn.event_manager.service.Authentication;

import com.datn.event_manager.dto.request.AuthenticationRequest;

public interface AuthenticationService {
   public String authenticate(AuthenticationRequest authenticationRequest);
}
