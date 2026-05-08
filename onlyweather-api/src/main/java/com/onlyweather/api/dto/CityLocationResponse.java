package com.onlyweather.api.dto;

public record CityLocationResponse (
    String name,
    double latitude,
    double longitude,
    String country,
    String countryCode,
    String timezone
){

}
