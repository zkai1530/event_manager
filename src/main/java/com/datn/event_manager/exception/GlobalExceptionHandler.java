package com.datn.event_manager.exception;

import java.nio.file.AccessDeniedException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.datn.event_manager.dto.response.APIResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<APIResponse> handlingRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(new APIResponse(e.getMessage(), null));
    }

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<APIResponse> handlingAppException(AppException e) {
        return ResponseEntity.status(e.getErrorCode().getHttpStatusCode())
                .body(new APIResponse(e.getErrorCode().getMessage(), null));
    }

    @ExceptionHandler(value = AuthorizationDeniedException.class)
    ResponseEntity<APIResponse> handleAccessDeniedException(AuthorizationDeniedException exception) {
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getHttpStatusCode())
                .body(new APIResponse(ErrorCode.UNAUTHORIZED.getMessage(), null));
    }
}
