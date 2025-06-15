package com.datn.event_manager.dto.response;

import com.datn.event_manager.entity.User.UserMode;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
    String userId;
    String email;
    String name;
    String avatarUrl;
    String phoneNumber;
    String location;
    String accountNumber;
    String accountName;
    String bankName;
    String bankShortName;
}
