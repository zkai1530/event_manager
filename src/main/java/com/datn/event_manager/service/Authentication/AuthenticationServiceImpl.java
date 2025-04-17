package com.datn.event_manager.service.Authentication;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.LogoutRequest;
import com.datn.event_manager.dto.response.LoginResponseDTO;
import com.datn.event_manager.dto.response.google.GoogleTokenResponse;
import com.datn.event_manager.dto.response.google.GoogleUserInfo;
import com.datn.event_manager.entity.Role;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.repository.RoleRepository;
import com.datn.event_manager.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    RestTemplate restTemplate;
    RoleRepository roleRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    String signerKey;

    @NonFinal
    @Value("${google.client.id}")
    String googleClientId;

    @NonFinal
    @Value("${google.client.secret}")
    String googleClientSecret;

    @NonFinal
    @Value("${google.redirect.uri}")
    String googleRedirectUri;

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Override
    public String authenticate(AuthenticationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) {
            throw new RuntimeException("Invalid password");
        } else {
            return generateToken(user);
        }

    }
    
    @Override
    public LoginResponseDTO loginWithGoogle(String code) {
        // 1. Exchange code to take access_token
        GoogleTokenResponse tokenResponse = exchangeCodeForToken(code);

        // 2. Take info user from google
        GoogleUserInfo userInfo = getUserInfo(tokenResponse.getAccess_token());

        // 3. Save user in DB
        User user = userRepository.findByEmail(userInfo.getEmail())
        .orElse(null);

        if (user == null) {
            try {
                Role role = roleRepository.findByRoleName("USER");
                user = User.builder()
                        .email(userInfo.getEmail())
                        .name(userInfo.getName())
                        .avatarUrl(userInfo.getPicture())
                        .role(role)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build();
                user = userRepository.save(user);
            } catch (Exception e) {
                user = userRepository.findByEmail(userInfo.getEmail())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            }
        }
 
        return new LoginResponseDTO(generateToken(user), user.getEmail(), user.getAvatarUrl());
    }

    private GoogleTokenResponse exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", googleRedirectUri);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<GoogleTokenResponse> response = restTemplate.postForEntity(TOKEN_URL, request, GoogleTokenResponse.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        }
        throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
    }

    private GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(USER_INFO_URL, HttpMethod.GET, entity, GoogleUserInfo.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        }
        throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
    }

    private String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("event_manager.com")
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        stringJoiner.add(user.getRole().getRoleName());
        return stringJoiner.toString();
    }

    @Override
    public void logout(LogoutRequest request) {
        
    }

    @Override
    public User getUserFromToken() {
        SecurityContext context = SecurityContextHolder.getContext();
        log.info(context.getAuthentication().getName());
        String email = context.getAuthentication().getName(); // subject in JWT
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return user;
    }

}
