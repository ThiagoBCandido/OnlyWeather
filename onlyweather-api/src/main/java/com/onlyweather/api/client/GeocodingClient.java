package com.onlyweather.api.client;

import com.onlyweather.api.dto.CityLocationResponse;
import com.onlyweather.api.dto.GeocodingApiResponse;
import com.onlyweather.api.exception.CityNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
public class GeocodingClient {

    private static final String GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

    private final RestTemplate restTemplate;

    public GeocodingClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public CityLocationResponse findCity(String city) {
        URI uri = UriComponentsBuilder.fromUriString(GEOCODING_URL)
                .queryParam("name", city)
                .queryParam("count", 1)
                .queryParam("language", "pt")
                .queryParam("format", "json").encode(StandardCharsets.UTF_8).build().toUri();

        GeocodingApiResponse response = restTemplate.getForObject(uri, GeocodingApiResponse.class);
        if (response == null || response.results() == null || response.results().isEmpty()) {
            throw new CityNotFoundException(city);
        }

        GeocodingApiResponse.GeocodingResult result = response.results().get(0);
        return new CityLocationResponse(result.name(), result.latitude(), result.longitude(), result.country(), result.countryCode(), result.timezone());
    }
}