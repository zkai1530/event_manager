package com.datn.event_manager.service.User;

import java.util.List;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.UserUpdateRequest;
import com.datn.event_manager.dto.response.UserResponse;

public interface UserService {
    public UserResponse createUser(AuthenticationRequest userRequest);

    public UserResponse getUserById(String userId);

    public List<UserResponse> getAllUsers();

    public UserResponse getUserInfo();

    public UserResponse updateUserInfo(UserUpdateRequest request);
}
