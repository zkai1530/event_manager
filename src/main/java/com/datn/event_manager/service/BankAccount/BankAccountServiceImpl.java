package com.datn.event_manager.service.BankAccount;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.request.BankAccountRequest;
import com.datn.event_manager.dto.response.BankAccountResponse;
import com.datn.event_manager.entity.BankAccount;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.BankAccountMapper;
import com.datn.event_manager.repository.BankAccountRepository;
import com.datn.event_manager.repository.UserRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import com.datn.event_manager.utils.AESEncryptionUtil;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BankAccountServiceImpl implements BankAccountService {
    BankAccountRepository bankAccountRepository;
    AuthenticationService authenticationService;
    UserRepository userRepository;
    BankAccountMapper bankAccountMapper;

    @NonFinal
    @Value("${bank.secret-key}")
    String bankSecretKey;

    @Override
    public BankAccountResponse createBankAccount(BankAccountRequest request) throws Exception {
        User user = authenticationService.getUserFromToken();
        if (user.getBankAccount() != null) {
            throw new AppException(ErrorCode.USER_ALREADY_HAS_BANK_ACCOUNT);
        }

        if (request.getAccountNumber() == null || request.getAccountName() == null ||
                request.getBankName() == null || request.getBankShortName() == null) {
            throw new AppException(ErrorCode.MISSING_REQUIRED_FIELDS);
        }

        BankAccount bankAccount = BankAccount.builder()
                .user(user)
                .accountName(request.getAccountName())
                .bankName(request.getBankName())
                .bankShortName(request.getBankShortName())
                .accountNumber(AESEncryptionUtil.encrypt(request.getAccountNumber(), bankSecretKey))
                .createdAt(LocalDateTime.now())
                .build();

        bankAccountRepository.save(bankAccount);
        return bankAccountMapper.toBankAccountResponse(bankAccount);
    }

    @Override
    public BankAccountResponse updateBankAccount(BankAccountRequest request) throws Exception {
        User user = authenticationService.getUserFromToken();
        if (user.getBankAccount() == null) {
            throw new AppException(ErrorCode.USER_HAS_NO_BANK_ACCOUNT);
        }
        BankAccount bankAccount = user.getBankAccount();
        bankAccount.setAccountName(request.getAccountName());
        bankAccount.setAccountNumber(AESEncryptionUtil.encrypt(request.getAccountNumber(), bankSecretKey));
        bankAccount.setBankName(request.getBankName());
        bankAccount.setBankShortName(request.getBankShortName());
        bankAccountRepository.save(bankAccount);

        return bankAccountMapper.toBankAccountResponse(bankAccount);
    }

    @Override
    public void deleteBankAccount(Long bankAccountId) {
        User user = authenticationService.getUserFromToken();
        if (user.getBankAccount() == null) {
            throw new AppException(ErrorCode.USER_HAS_NO_BANK_ACCOUNT);
        }

        user.setBankAccount(null);
        userRepository.save(user);
    }

    @Override
    public BankAccountResponse getMyBankAccount() throws Exception {
        User user = authenticationService.getUserFromToken();
        BankAccount bankAccount = user.getBankAccount();

        if (user.getBankAccount() == null) {
            throw new AppException(ErrorCode.USER_HAS_NO_BANK_ACCOUNT);
        }
        
        bankAccount.setAccountNumber(AESEncryptionUtil.decrypt(bankAccount.getAccountNumber(), bankSecretKey));
        return bankAccountMapper.toBankAccountResponse(bankAccount);
    }

}
