import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

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
  latitude: number;
  longitude: number;
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

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiUrl = `${environment.apiUrl}/weather`;
  constructor(private http: HttpClient) {}
  getWeatherByCity(city: string): Observable<WeatherData> {
    const params = new HttpParams().set('city', city);

    return this.http.get<WeatherData>(this.apiUrl, { params }).pipe(catchError((error) => {
        const message = error?.error?.message || 'Não foi possível buscar o clima agora.';
        return throwError(() => new Error(message));
      })
    );
  }
}
