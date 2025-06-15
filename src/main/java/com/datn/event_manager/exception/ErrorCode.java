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
    USER_ALREADY_BLOCKED("User is already blocked!", HttpStatus.BAD_REQUEST),
    USER_ALREADY_ACTIVE("User is already active!", HttpStatus.BAD_REQUEST),
    MISSING_REQUIRED_FIELDS("Missing field!", HttpStatus.BAD_REQUEST),
    EVENT_NOT_FOUND("Event not found!", HttpStatus.NOT_FOUND),
    EVENT_ALREADY_PUBLISHED("Event is already published!", HttpStatus.BAD_REQUEST),
    EVENT_ALREADY_UNPUBLISHED("Event is already unpublished!", HttpStatus.BAD_REQUEST),
    EVENT_ALREADY_HIDDEN("Event is already hidden!", HttpStatus.BAD_REQUEST),
    EVENT_ALREADY_VISIBLE("Event is already visible!", HttpStatus.BAD_REQUEST),
    TICKET_NOT_FOUND("Ticket not found!", HttpStatus.NOT_FOUND),
    TICKET_QUANTITY_EXCEEDS_AVAILABLE("Ticket quantity exceeds available!", HttpStatus.BAD_REQUEST),
    TICKET_NOT_AVAILABLE("Ticket not available!", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_FOUND("Schedule not found!", HttpStatus.NOT_FOUND),
    DISCOUNT_NOT_FOUND("Discount not found!", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND("Payment not found!", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND("Order not found!", HttpStatus.NOT_FOUND),
    ORDER_EXPIRED("Order has expired!", HttpStatus.BAD_REQUEST),
    ORDER_NOT_PENDING("Order is not pending!", HttpStatus.BAD_REQUEST),
    FAVORITE_NOT_FOUND("Favorite not found!", HttpStatus.NOT_FOUND),
    NOTIFICATION_NOT_FOUND("Notification not found!", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND("Category not found!", HttpStatus.NOT_FOUND),
    THEME_NOT_FOUND("Theme not found!", HttpStatus.NOT_FOUND),
    DISCOUNT_EXPIRED("Discount has expired!", HttpStatus.BAD_REQUEST),
    DISCOUNT_USAGE_LIMIT_REACHED("Discount has reached maximum usage!", HttpStatus.NOT_FOUND),
    GOOGLE_AUTH_FAILED("Google auth failed", HttpStatus.NOT_FOUND),
    INVALID_SALE_DATES("Invalid sale dates!", HttpStatus.NOT_FOUND),
    DATE_TIME_IS_NULL("Datetime is null!", HttpStatus.BAD_REQUEST),
    CONFLICT_SCHEDULE("Schedule conflict detected!", HttpStatus.CONFLICT),
    EVENT_TYPE_MUST_BE_RECURRING("Event Type must be recurring", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED("Upload image failed!", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST_DATA("Invalid request data!", HttpStatus.BAD_REQUEST),
    ALREADY_FAVORITED("Event already added to your favorites!", HttpStatus.BAD_REQUEST),
    ALREADY_FOLLOW("You are already following this user", HttpStatus.BAD_REQUEST),
    ALREADY_CHECKED_IN("This order already checked in!", HttpStatus.BAD_REQUEST),
    NOT_FOLLOWING("You are not following this user", HttpStatus.BAD_REQUEST),
    USER_ALREADY_HAS_BANK_ACCOUNT("User already has bank account!", HttpStatus.CONFLICT),
    USER_HAS_NO_BANK_ACCOUNT("User has no bank account!", HttpStatus.NOT_FOUND),
    BANK_ACCOUNT_UPDATE_FAILED("Bank Account update failed!", HttpStatus.BAD_REQUEST),
    REASON_NOT_FOUND("Reason not found!", HttpStatus.NOT_FOUND),
    ALREADY_COMPLAINED("You have already submitted a complaint for this order.", HttpStatus.BAD_REQUEST),
    ALREADY_DISBURSED("This event has already been disbursed.", HttpStatus.BAD_REQUEST);

    ErrorCode(String message, HttpStatusCode httpStatusCode) {
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    private final String message;
    private final HttpStatusCode httpStatusCode;
}
