package com.datn.event_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.datn.event_manager.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.roleName = 'USER'")
    List<User> findAllUserByRoleName(String roleName);
}
