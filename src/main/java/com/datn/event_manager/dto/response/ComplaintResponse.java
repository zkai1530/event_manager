package com.datn.event_manager.dto.response;

import java.time.LocalDateTime;

import com.datn.event_manager.entity.Complaint.ComplaintStatus;

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
public class ComplaintResponse {
    Long complaintId;
    Long orderId;
    String userName;
    String email;
    Long eventId;
    String eventName;
    String description;
    ComplaintStatus status;
    LocalDateTime createdAt;
}
