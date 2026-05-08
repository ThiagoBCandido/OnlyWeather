package com.onlyweather.api.dto;

import java.util.List;

public record WeatherResponse(
    String cityName,
    String country,
    String countryCode,
    int temperature,
    int feelsLike,
    int humidity,
    int windSpeed,
    String condition,
    String weatherType,
    String icon,
    String updatedAt,
    List<ForecastDayResponse> forecast
) {
}
