package com.datn.event_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.dto.request.DiscountRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.Discount.DiscountService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/discount")
public class DiscountController {
    DiscountService discountService;

    @PostMapping
    public ResponseEntity<APIResponse> createDiscount(@RequestBody DiscountRequest request) {
        discountService.createDiscount(request);
        return ResponseEntity.ok(new APIResponse(Message.CREATE_PROMOTION_SUCCESS, null));
    }

    @PutMapping("/{discountId}")
    public ResponseEntity<APIResponse> updateDiscount(@PathVariable Long discountId, @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(new APIResponse(Message.UPDATE_PROMOTION_SUCCESS, discountService.updateDiscount(discountId, request)));
    }

    @DeleteMapping("/{discountId}")
    public ResponseEntity<APIResponse> deleteDiscount(@PathVariable Long discountId) {
        discountService.deleteDiscount(discountId);
        return ResponseEntity.ok(new APIResponse(Message.DELETE_PROMOTION_SUCCESS, null));
    }

    @GetMapping("/{discountId}")
    public ResponseEntity<APIResponse> viewDiscountById(@PathVariable Long discountId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, discountService.viewDiscountById(discountId)));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<APIResponse> viewAllDiscountByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(new APIResponse(Message.RESOURCE_FOUND, discountService.viewAllDiscountByEventId(eventId)));
    }
}
