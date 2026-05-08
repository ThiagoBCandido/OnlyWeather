package com.onlyweather.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public Map<String, Object> healthCheck() {
        return Map.of("status", "UP", "service", "OnlyWeather API", "message", "Backend is running", "timestamp", LocalDateTime.now());
    }
}