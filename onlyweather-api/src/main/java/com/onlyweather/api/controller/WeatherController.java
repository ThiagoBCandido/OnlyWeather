package com.onlyweather.api.controller;

import com.onlyweather.api.dto.WeatherResponse;
import com.onlyweather.api.service.WeatherService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/api/weather")
    public WeatherResponse getWeatherByCity(
            @RequestParam @NotBlank String city
    ) {return weatherService.getWeatherByCity(city);}
}