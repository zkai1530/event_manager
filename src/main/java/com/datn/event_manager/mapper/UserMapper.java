package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.response.UserResponse;
import com.datn.event_manager.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(AuthenticationRequest request);

    UserResponse toUserResponse(AuthenticationRequest request);

    @Mapping(target = "roleName", source = "role.roleName")
    UserResponse toUserResponse(User user);
    List<UserResponse> toUserResponseList(List<User> users);
}
