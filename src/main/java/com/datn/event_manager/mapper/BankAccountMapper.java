package com.datn.event_manager.mapper;

import org.mapstruct.Mapper;

import com.datn.event_manager.dto.response.BankAccountResponse;
import com.datn.event_manager.entity.BankAccount;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {
    BankAccountResponse toBankAccountResponse(BankAccount bankAccount);
}
