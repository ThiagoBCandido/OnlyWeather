package com.onlyweather.api.dto;

public record SunInfoResponse(
        String sunrise,
        String sunset,
        int daylightDurationSeconds
) {
}