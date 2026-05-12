package com.onlyweather.api.service;

import com.onlyweather.api.client.GeocodingClient;
import com.onlyweather.api.client.OpenMeteoClient;
import com.onlyweather.api.dto.CityLocationResponse;
import com.onlyweather.api.dto.ForecastDayResponse;
import com.onlyweather.api.dto.OpenMeteoApiResponse;
import com.onlyweather.api.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class WeatherService {

    private final GeocodingClient geocodingClient;
    private final OpenMeteoClient openMeteoClient;

    public WeatherService(
            GeocodingClient geocodingClient,
            OpenMeteoClient openMeteoClient
    ) {
        this.geocodingClient = geocodingClient;
        this.openMeteoClient = openMeteoClient;
    }

    public WeatherResponse getWeatherByCity(String city) {
        CityLocationResponse location = geocodingClient.findCity(city);
        OpenMeteoApiResponse apiResponse = openMeteoClient.getForecast(location);

        if (apiResponse == null || apiResponse.current() == null || apiResponse.daily() == null) {
            throw new IllegalStateException("Resposta inválida da API de clima.");
        }

        int currentCode = apiResponse.current().weatherCode();
        boolean isDay = apiResponse.current().isDay() == 1;

        String weatherType = getCurrentWeatherType(currentCode, isDay);

        return new WeatherResponse(
                location.name(),
                location.country(),
                location.countryCode(),
                location.latitude(),
                location.longitude(),
                round(apiResponse.current().temperature()),
                round(apiResponse.current().apparentTemperature()),
                apiResponse.current().humidity(),
                round(apiResponse.current().windSpeed()),
                getCondition(currentCode, isDay),
                weatherType,
                getIcon(weatherType),
                apiResponse.current().time(),
                mapForecast(apiResponse)
        );
    }

    private List<ForecastDayResponse> mapForecast(OpenMeteoApiResponse apiResponse) {
        List<ForecastDayResponse> forecast = new ArrayList<>();
        List<String> dates = apiResponse.daily().time();

        for (int index = 0; index < dates.size(); index++) {
            int weatherCode = apiResponse.daily().weatherCode().get(index);
            String weatherType = getDayWeatherType(weatherCode);
            String date = dates.get(index);

            forecast.add(
                    new ForecastDayResponse(
                            formatDay(date),
                            date,
                            round(apiResponse.daily().minTemperature().get(index)),
                            round(apiResponse.daily().maxTemperature().get(index)),
                            getSafeRainChance(apiResponse, index),
                            getCondition(weatherCode, true), weatherType, 
                            getIcon(weatherType)
                    )
            );
        }

        return forecast;
    }

    private int getSafeRainChance(OpenMeteoApiResponse apiResponse, int index) {
        if (apiResponse.daily().rainChance() == null) {
            return 0;
        }

        Integer value = apiResponse.daily().rainChance().get(index);

        return value == null ? 0 : value;
    }

    private String formatDay(String date) {
        LocalDate localDate = LocalDate.parse(date);

        return localDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }

    private String getCurrentWeatherType(int code, boolean isDay) {
        if (isDay) {
            return getDayWeatherType(code);
        }

        if (isStorm(code)) {
            return "stormy-night";
        }

        if (isRain(code)) {
            return "rainy-night";
        }

        return "night";
    }

    private String getDayWeatherType(int code) {
        if (code == 0 || code == 1) {
            return "sunny";
        }

        if (code == 2) {
            return "partly-cloudy";
        }

        if (isCloudy(code)) {
            return "cloudy";
        }

        if (isRain(code)) {
            return "rainy";
        }

        if (isStorm(code)) {
            return "heavy-rain";
        }

        return "cloudy";
    }

    private boolean isCloudy(int code) {
        return code == 3 || code == 45 || code == 48;
    }

    private boolean isRain(int code) {
        return code == 51 ||
                code == 53 ||
                code == 55 ||
                code == 56 ||
                code == 57 ||
                code == 61 ||
                code == 63 ||
                code == 65 ||
                code == 66 ||
                code == 67 ||
                code == 80 ||
                code == 81;
    }

    private boolean isStorm(int code) {
        return code == 82 ||
                code == 95 ||
                code == 96 ||
                code == 99;
    }

    private String getCondition(int code, boolean isDay) {
        if (!isDay) {
            if (isStorm(code)) {
                return "Stormy night";
            }

            if (isRain(code)) {
                return "Rainy night";
            }

            return "Night";
        }

        return switch (code) {
            case 0 -> "Sunny";
            case 1 -> "Mostly sunny";
            case 2 -> "Partly cloudy";
            case 3 -> "Cloudy";
            case 45, 48 -> "Foggy";
            case 51 -> "Light drizzle";
            case 53 -> "Drizzle";
            case 55 -> "Heavy drizzle";
            case 56, 57 -> "Freezing drizzle";
            case 61 -> "Light rain";
            case 63 -> "Rainy";
            case 65 -> "Heavy rain";
            case 66, 67 -> "Freezing rain";
            case 71 -> "Light snow";
            case 73 -> "Snowy";
            case 75 -> "Heavy snow";
            case 77 -> "Snow grains";
            case 80 -> "Light showers";
            case 81 -> "Rain showers";
            case 82 -> "Heavy rain";
            case 85 -> "Snow showers";
            case 86 -> "Heavy snow showers";
            case 95 -> "Thunderstorm";
            case 96 -> "Thunderstorm with hail";
            case 99 -> "Severe thunderstorm";
            default -> "Cloudy";
        };
    }

    private String getIcon(String weatherType) {
        return "assets/weather-icons/" + weatherType + ".svg";
    }

    private int round(double value) {
        return (int) Math.round(value);
    }
}