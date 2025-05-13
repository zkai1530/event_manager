package com.datn.event_manager.service.Authentication;

import java.text.ParseException;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.LogoutRequest;
import com.datn.event_manager.dto.response.IntrospectResponse;
import com.datn.event_manager.dto.response.LoginResponseDTO;
import com.datn.event_manager.entity.User;
import com.nimbusds.jose.JOSEException;

public interface AuthenticationService {
   public String authenticate(AuthenticationRequest authenticationRequest);

   public void logout(LogoutRequest request) throws JOSEException, ParseException;

   public User getUserFromToken();

   public LoginResponseDTO loginWithGoogle(String code);

   IntrospectResponse introspect(String token) throws JOSEException, ParseException;
}
