package com.onlyweather.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoApiResponse(CurrentWeather current, DailyWeather daily) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CurrentWeather(
            String time,
            @JsonProperty("temperature_2m")
            double temperature,
            @JsonProperty("relative_humidity_2m")
            int humidity,
            @JsonProperty("apparent_temperature")
            double apparentTemperature,
            @JsonProperty("weather_code")
            int weatherCode,
            @JsonProperty("wind_speed_10m")
            double windSpeed
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DailyWeather(
            List<String> time,
            @JsonProperty("weather_code")
            List<Integer> weatherCode,
            @JsonProperty("temperature_2m_max")
            List<Double> maxTemperature,
            @JsonProperty("temperature_2m_min")
            List<Double> minTemperature,
            @JsonProperty("precipitation_probability_max")
            List<Integer> rainChance
    ) {
    }
}