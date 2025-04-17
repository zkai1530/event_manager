package com.datn.event_manager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datn.event_manager.service.EmailService;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class EmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/send-mail")
    public String sendMail() {
        try {
            emailService.sendEmail("hanphong1530@gmail.com", "Test Email", "Hello, this is a test email from Spring Boot!");
            return "Email sent successfully!";
        } catch (Exception e) {
            log.error("Error sending email", e);
            return "Failed to send email: " + e.getMessage() + " | Cause: " + e.getCause();
        }
    }
}
