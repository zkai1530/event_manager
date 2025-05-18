package com.datn.event_manager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.UserUpdateRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.User.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/user")
public class UserController {
    UserService userService;

    @NonFinal
    @Value("${list-users}")
    int LIST_USERS;

    @PostMapping("/signup")
    public ResponseEntity<APIResponse> createUser(@RequestBody AuthenticationRequest userRequest) {
        return ResponseEntity.ok(new APIResponse(Message.SIGNUP_SUCCESS, userService.createUser(userRequest)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<APIResponse> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(new APIResponse("getUser", userService.getUserById(userId)));
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse> getAllUsers(@RequestParam(required = false, defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, LIST_USERS);
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, userService.getAllUsers(pageable)));
    }

    @GetMapping("/me")
    public ResponseEntity<APIResponse> getUserInfo() {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, userService.getUserInfo()));
    }

    @PutMapping("/me")
    public ResponseEntity<APIResponse> updateUserInfo(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.SUCCESS_REQUEST, userService.updateUserInfo(request)));
    }
}
