package com.datn.event_manager.service.User;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.UserUpdateRequest;
import com.datn.event_manager.dto.response.UserManageResponse;
import com.datn.event_manager.dto.response.UserProfileResponse;
import com.datn.event_manager.dto.response.UserResponse;

public interface UserService {
    public UserResponse createUser(AuthenticationRequest userRequest);

    public UserResponse getUserById(String userId);

    public Page<UserManageResponse> getAllUsers(Pageable pageable);

    public UserResponse getUserInfo();

    public Page<UserManageResponse> searchUserByNameOrEmail(String keyword, Pageable pageable);
    
    public void blockUser(String userId);
    
    public void unblockUser(String userId);
    
    public UserProfileResponse getUserProfileInfo();
    
    public UserProfileResponse updateUserProfileInfo(UserUpdateRequest request);
}
