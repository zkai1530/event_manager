package com.datn.event_manager.dto.response;

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
public class UserManageResponse {
    String userId;
    String email;
    String name;
    String phoneNumber;
    String avatarUrl;
    String roleName;
    Boolean isActive;
    int totalSoldTickets;
    int totalPurchasedTickets;
    int totalEvents;
}
