import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';

export type WeatherType =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'heavy-rain';

export interface ForecastDay {
  day: string;
  date: string;
  minTemperature: number;
  maxTemperature: number;
  rainChance: number;
  condition: string;
  weatherType: WeatherType;
  icon: string;
}

export interface WeatherData {
  cityName: string;
  country: string;
  countryCode: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherType: WeatherType;
  icon: string;
  updatedAt: string;
  forecast: ForecastDay[];
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  timezone: string;
  admin1?: string;
}

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly forecastUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getWeatherByCity(city: string): Observable<WeatherData> {
    const geocodingParams = new HttpParams()
      .set('name', city)
      .set('count', 1)
      .set('language', 'pt')
      .set('format', 'json');

    return this.http
      .get<GeocodingResponse>(this.geocodingUrl, { params: geocodingParams })
      .pipe(
        map((response) => {
          const location = response.results?.[0];

          if (!location) {
            throw new Error('Cidade não encontrada.');
          }

          return location;
        }),
        switchMap((location) => this.getForecastByLocation(location)),
        catchError((error) => {
          const message =
            error?.message || 'Não foi possível buscar o clima agora.';

          return throwError(() => new Error(message));
        })
      );
  }

  private getForecastByLocation(
    location: GeocodingResult
  ): Observable<WeatherData> {
    const forecastParams = new HttpParams()
      .set('latitude', location.latitude)
      .set('longitude', location.longitude)
      .set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'
      )
      .set(
        'daily',
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      )
      .set('timezone', 'auto')
      .set('forecast_days', 7)
      .set('wind_speed_unit', 'kmh');

    return this.http
      .get<OpenMeteoResponse>(this.forecastUrl, { params: forecastParams })
      .pipe(map((response) => this.mapToWeatherData(location, response)));
  }

  private mapToWeatherData(
    location: GeocodingResult,
    response: OpenMeteoResponse
  ): WeatherData {
    const currentCode = response.current.weather_code;
    const currentWeatherType = this.getWeatherType(currentCode);

    return {
      cityName: location.name,
      country: location.country,
      countryCode: location.country_code,
      temperature: Math.round(response.current.temperature_2m),
      feelsLike: Math.round(response.current.apparent_temperature),
      humidity: response.current.relative_humidity_2m,
      windSpeed: Math.round(response.current.wind_speed_10m),
      condition: this.getCondition(currentCode),
      weatherType: currentWeatherType,
      icon: this.getIcon(currentWeatherType),
      updatedAt: response.current.time,
      forecast: this.mapForecast(response)
    };
  }

  private mapForecast(response: OpenMeteoResponse): ForecastDay[] {
    return response.daily.time.slice(0, 7).map((date, index) => {
      const weatherCode = response.daily.weather_code[index];
      const weatherType = this.getWeatherType(weatherCode);

      return {
        date,
        day: this.formatDay(date),
        minTemperature: Math.round(response.daily.temperature_2m_min[index]),
        maxTemperature: Math.round(response.daily.temperature_2m_max[index]),
        rainChance: response.daily.precipitation_probability_max[index] ?? 0,
        condition: this.getCondition(weatherCode),
        weatherType,
        icon: this.getIcon(weatherType)
      };
    });
  }

  private formatDay(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short'
    }).format(new Date(`${date}T00:00:00`));
  }

  private getWeatherType(code: number): WeatherType {
    if (code === 0 || code === 1) {
      return 'sunny';
    }

    if (code === 2) {
      return 'partly-cloudy';
    }

    if (code === 3 || code === 45 || code === 48) {
      return 'cloudy';
    }

    if (
      code === 51 ||
      code === 53 ||
      code === 55 ||
      code === 56 ||
      code === 57 ||
      code === 61 ||
      code === 63 ||
      code === 65 ||
      code === 66 ||
      code === 67 ||
      code === 80 ||
      code === 81
    ) {
      return 'rainy';
    }

    if (code === 82 || code === 95 || code === 96 || code === 99) {
      return 'heavy-rain';
    }

    return 'cloudy';
  }

  private getCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'Sunny',
      1: 'Mostly sunny',
      2: 'Partly cloudy',
      3: 'Cloudy',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Light rain',
      63: 'Rainy',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Freezing rain',
      71: 'Light snow',
      73: 'Snowy',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Light showers',
      81: 'Rain showers',
      82: 'Heavy rain',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Severe thunderstorm'
    };

    return conditions[code] ?? 'Cloudy';
  }

  private getIcon(weatherType: WeatherType): string {
    return `assets/weather-icons/${weatherType}.svg`;
  }
}