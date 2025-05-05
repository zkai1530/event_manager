package com.datn.event_manager.service.BankAccount;

import com.datn.event_manager.dto.request.BankAccountRequest;
import com.datn.event_manager.dto.response.BankAccountResponse;
import com.datn.event_manager.entity.BankAccount;


public interface BankAccountService {
    BankAccountResponse createBankAccount(BankAccountRequest request) throws Exception;

    BankAccountResponse updateBankAccount(BankAccountRequest request) throws Exception;

    void deleteBankAccount(Long bankAccountId);

    BankAccountResponse getMyBankAccount() throws Exception;

}
