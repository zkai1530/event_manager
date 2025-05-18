package com.datn.event_manager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.datn.event_manager.dto.response.UserManageResponse;
import com.datn.event_manager.dto.response.UserResponse;
import com.datn.event_manager.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT f.follower.userId FROM Follow f WHERE f.following.userId = :userId")
    List<String> findFollowersByUserId(String userId);

    @Query("SELECT new com.datn.event_manager.dto.response.UserManageResponse(" +
            "u.email, u.name, u.phoneNumber, u.avatarUrl, u.role.roleName, u.isActive, 0, 0, 0) " +
            "FROM User u WHERE u.role.roleName = 'USER'")
    Page<UserManageResponse> findAllUsers(Pageable pageable);

    @Query("SELECT new com.datn.event_manager.dto.response.UserManageResponse(" +
            "u.email, u.name, u.phoneNumber, u.avatarUrl, u.role.roleName, u.isActive, 0, 0, 0) " +
            "FROM User u WHERE u.role.roleName = 'USER' " +
            "AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<UserManageResponse> searchUsersByNameOrEmail(@Param("keyword") String keyword, Pageable pageable);
}
