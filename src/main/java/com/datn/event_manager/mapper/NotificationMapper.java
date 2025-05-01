package com.datn.event_manager.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.datn.event_manager.dto.response.NotificationResponse;
import com.datn.event_manager.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "eventId", source = "event.eventId")
    @Mapping(target = "userId", source = "user.userId")
    NotificationResponse toNotificationResponse(Notification notification);
}
