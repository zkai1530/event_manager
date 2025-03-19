package com.datn.event_manager.exception;

import java.security.Permission;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("User not found!", HttpStatus.NOT_FOUND),
    USER_EXISTED("User is existed!", HttpStatus.CONFLICT),
    UNAUTHORIZED("Access Denied! (unauthorized)", HttpStatus.FORBIDDEN), // when token don't have permission
    UNAUTHENTICATED("Unauthenticated", HttpStatus.UNAUTHORIZED), // when token isn't existed
    EVENT_NOT_FOUND("Event not found!", HttpStatus.NOT_FOUND),
    DATE_TIME_IS_NULL("Datetime is null!", HttpStatus.BAD_REQUEST);

    ErrorCode(String message, HttpStatusCode httpStatusCode) {
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private final String message;
    private final HttpStatusCode httpStatusCode;
}
