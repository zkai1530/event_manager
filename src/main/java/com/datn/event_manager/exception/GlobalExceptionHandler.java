package com.datn.event_manager.exception;

import java.nio.file.AccessDeniedException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.datn.event_manager.dto.response.APIResponse;

import lombok.extern.slf4j.Slf4j;
import vn.payos.exception.PayOSException;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<APIResponse> handlingRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(new APIResponse(e.getMessage(), null));
    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<APIResponse> handleRuntimeException(RuntimeException e) {
        log.error("Unhandled exception: {}", e.getMessage());
        return ResponseEntity.badRequest().body(new APIResponse("Internal Server Error", e.getMessage()));
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

    @ExceptionHandler(value = PayOSException.class)
    public ResponseEntity<APIResponse> handlePayOSException(PayOSException exception) {
        log.error("Error code: {}", exception.getCode());
        log.error("Message: {}", exception.getMessage());
        if (exception.getCode().equals("401")) {
            return ResponseEntity.status(ErrorCode.UNAUTHENTICATED.getHttpStatusCode())
                    .body(new APIResponse(ErrorCode.UNAUTHENTICATED.getMessage(), exception.getMessage()));
        }
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST_DATA.getHttpStatusCode())
                .body(new APIResponse(ErrorCode.INVALID_REQUEST_DATA.getMessage(), exception.getMessage()));
    }
}
