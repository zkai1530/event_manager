package com.datn.event_manager.service.PingService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PingService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String url = "https://event-manager-5elo.onrender.com/event/14";

    @Scheduled(fixedRate = 9 * 60 * 1000) // 9 phút
    public void pingEvent() {
        try {
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("Ping /event/14 thành công: " + response);
        } catch (Exception e) {
            System.err.println("Ping /event/14 lỗi: " + e.getMessage());
        }
    }
}
