package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.service.User.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/user")
public class UserController {
    UserService userService;

    @PostMapping
    public ResponseEntity<APIResponse> createUser(@RequestBody AuthenticationRequest userRequest) {
        return ResponseEntity.ok(new APIResponse("createUser", userService.createUser(userRequest)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<APIResponse> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(new APIResponse("getUser", userService.getUserById(userId)));
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse> getAllUsers() {
        return ResponseEntity.ok(new APIResponse("getAllUsers", userService.getAllUsers()));
    }

    @GetMapping("/getInfo")
    public ResponseEntity<APIResponse> getUserInfo() {
        return ResponseEntity.ok(new APIResponse("getUserInfo", userService.getUserInfo()));
    }

}
