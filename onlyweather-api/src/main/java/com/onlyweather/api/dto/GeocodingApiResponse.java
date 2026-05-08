package com.onlyweather.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeocodingApiResponse(List<GeocodingResult> results) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeocodingResult(
            String name,
            double latitude,
            double longitude,
            String country,
            @JsonProperty("country_code")
            String countryCode,
            String timezone
    ) {
    }
}