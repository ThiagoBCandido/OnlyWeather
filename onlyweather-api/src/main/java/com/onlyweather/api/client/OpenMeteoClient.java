package com.onlyweather.api.client;

import com.onlyweather.api.dto.CityLocationResponse;
import com.onlyweather.api.dto.OpenMeteoApiResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
public class OpenMeteoClient {
    private static final String FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
    private final RestTemplate restTemplate;
    public OpenMeteoClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public OpenMeteoApiResponse getForecast(CityLocationResponse location) {
        URI uri = UriComponentsBuilder.fromUriString(FORECAST_URL)
                .queryParam("latitude", location.latitude())
                .queryParam("longitude", location.longitude())
                .queryParam("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m")
                .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max")
                .queryParam("timezone", "auto")
                .queryParam("forecast_days", 7)
                .queryParam("wind_speed_unit", "kmh").encode(StandardCharsets.UTF_8).build().toUri();
        return restTemplate.getForObject(uri, OpenMeteoApiResponse.class);
    }
}