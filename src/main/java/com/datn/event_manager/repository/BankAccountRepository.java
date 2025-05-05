package com.datn.event_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datn.event_manager.entity.BankAccount;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long>{
    
}
