package com.datn.event_manager.exception;

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
    TICKET_NOT_FOUND("Ticket not found!", HttpStatus.NOT_FOUND),
    SCHEDULE_NOT_FOUND("Schedule not found!", HttpStatus.NOT_FOUND),
    DISCOUNT_NOT_FOUND("Discount not found!", HttpStatus.NOT_FOUND),
    INVALID_SALE_DATES("Invalid sale dates!", HttpStatus.NOT_FOUND),
    DATE_TIME_IS_NULL("Datetime is null!", HttpStatus.BAD_REQUEST),
    CONFLICT_SCHEDULE("Schedule conflict detected!", HttpStatus.CONFLICT),
    EVENT_TYPE_MUST_BE_RECURRING("Event Type must be recurring", HttpStatus.BAD_REQUEST);

    ErrorCode(String message, HttpStatusCode httpStatusCode) {
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private final String message;
    private final HttpStatusCode httpStatusCode;
}
