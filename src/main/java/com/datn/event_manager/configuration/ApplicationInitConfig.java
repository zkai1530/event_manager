package com.datn.event_manager.configuration;

import java.time.LocalDateTime;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.datn.event_manager.entity.Role;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.repository.RoleRepository;
import com.datn.event_manager.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
            if (userRepository.findByEmail("admin").isEmpty()) {
                Role role = roleRepository.findByRoleName("ADMIN");
                User user = User.builder()
                        .email("admin")
                        .password(passwordEncoder.encode("admin"))
                        .role(role)
                        .createdAt(LocalDateTime.now())
                        .isActive(true)
                        .build();
                userRepository.save(user);
            }
        };
    }
}
