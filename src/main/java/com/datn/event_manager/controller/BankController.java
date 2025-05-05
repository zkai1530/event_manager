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

import com.datn.event_manager.dto.request.BankAccountRequest;
import com.datn.event_manager.dto.response.APIResponse;
import com.datn.event_manager.dto.response.Message;
import com.datn.event_manager.service.BankAccount.BankAccountService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/bank-account")
public class BankController {
    BankAccountService bankAccountService;

    @PostMapping
    public ResponseEntity<APIResponse> createBankAccount(@RequestBody BankAccountRequest request) throws Exception {
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, bankAccountService.createBankAccount(request)));
    }

    @PutMapping
    public ResponseEntity<APIResponse> updateBankAccount(@RequestBody BankAccountRequest request) throws Exception {
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, bankAccountService.updateBankAccount(request)));
    }

    @DeleteMapping("/{bankAccountId}")
    public ResponseEntity<APIResponse> deleteBankAccount(@PathVariable Long bankAccountId) {
        bankAccountService.deleteBankAccount(bankAccountId);
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, null));
    }

    @GetMapping
    public ResponseEntity<APIResponse> getMyBankAccount() throws Exception{
        return ResponseEntity
                .ok(new APIResponse(Message.SUCCESS_REQUEST, bankAccountService.getMyBankAccount()));
    }
}
