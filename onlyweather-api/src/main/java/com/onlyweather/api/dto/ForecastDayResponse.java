package com.onlyweather.api.dto;

public record ForecastDayResponse(
    String day,
    String date,
    int minTemperature,
    int maxTemperature,
    int rainChance,
    String condition,
    String weatherType,
    String icon
) {
    
}
