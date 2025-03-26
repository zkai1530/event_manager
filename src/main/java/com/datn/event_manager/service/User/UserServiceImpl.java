package com.datn.event_manager.service.User;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.request.UserUpdateRequest;
import com.datn.event_manager.dto.response.UserResponse;
import com.datn.event_manager.entity.Role;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.User.UserMode;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.UserMapper;
import com.datn.event_manager.mapper.UserMapperImpl;
import com.datn.event_manager.repository.RoleRepository;
import com.datn.event_manager.repository.UserRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserMapperImpl userMapperImpl;
    UserRepository userRepository;
    RoleRepository roleRepository;
    AuthenticationService authenticationService;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(AuthenticationRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        Role role = roleRepository.findByRoleName("USER");
        User user = User.builder()
                .email(userRequest.getEmail())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .createdAt(LocalDateTime.now())
                .currentMode(UserMode.USER)
                .isActive(true)
                .role(role)
                .build();
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public List<UserResponse> getAllUsers() {
        // return user with role is USER
        List<User> users = userRepository.findAllUserByRoleName("USER");
        return userMapper.toUserResponseList(users);
    }

    @Override
    public UserResponse getUserInfo() {
        User user = authenticationService.getUserFromToken();
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse updateUserInfo(UserUpdateRequest request) {
        User user = authenticationService.getUserFromToken();

        user.setName(request.getName() != null ? request.getName() : user.getName());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : user.getPhoneNumber());
        user.setAvatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : user.getAvatarUrl());
        user.setLocation(request.getLocation() != null ? request.getLocation() : user.getLocation());

        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }
}
