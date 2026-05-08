package com.onlyweather.api.exception;

public class CityNotFoundException extends RuntimeException {
    public CityNotFoundException(String city) {
        super("Cidade não encontrada: " + city);
    }
}