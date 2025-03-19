package com.datn.event_manager.service.Authentication;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.LogoutRequest;
import com.datn.event_manager.entity.User;

public interface AuthenticationService {
   public String authenticate(AuthenticationRequest authenticationRequest);
   public void logout(LogoutRequest request);
   public User getUserFromUser();
}
