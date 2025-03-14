package com.datn.event_manager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("user not found", HttpStatus.NOT_FOUND),
    USER_EXISTED("user is existed", HttpStatus.NOT_FOUND);

    ErrorCode(String message, HttpStatusCode httpStatusCode) {
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private final String message;
    private final HttpStatusCode httpStatusCode;
}
