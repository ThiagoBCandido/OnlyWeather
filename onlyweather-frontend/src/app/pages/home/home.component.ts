import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WeatherMapComponent, WeatherMapLocation } from '../../features/weather-map/weather-map.component';
import { ForecastDay, WeatherData, WeatherService, WeatherType } from '../../core/services/weather.service';
import { BRIGHT_WEATHER_TYPES, WEATHER_THEMES, WeatherTheme } from './weather-themes';

const FAVORITES_STORAGE_KEY = 'onlyweather-favorite-cities';
const THEME_STORAGE_KEY = 'onlyweather-theme';
const ICON_VERSION = 'v=3';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, WeatherMapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  selectedWeather: WeatherType = 'partly-cloudy';
  searchTerm = 'Ribeirão Preto';

  weatherData: WeatherData | null = null;
  selectedLocation: WeatherMapLocation | null = null;
  forecast: ForecastDay[] = [];

  isLoading = false;
  errorMessage = '';
  favoriteCities: string[] = this.loadFavoriteCities();
  isDarkMode = localStorage.getItem(THEME_STORAGE_KEY) === 'dark';

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.searchWeather();
  }

  get currentTheme(): WeatherTheme {
    return WEATHER_THEMES[this.selectedWeather];
  }

  get themeIcon(): string {
    return this.isDarkMode ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
  }

  get themeLabel(): string {
    return this.isDarkMode ? 'Light' : 'Dark';
  }

  get pageBackground(): string {
    return this.isDarkMode
      ? this.currentTheme.darkBackground
      : this.currentTheme.background;
  }

  get appContainerTheme(): string {
    return this.isDarkMode
      ? 'bg-black/30 border-white/10 text-white'
      : 'bg-white/45 border-white/50 text-slate-950';
  }

  get weatherCardTheme(): string {
    return this.isDarkMode ? this.currentTheme.darkCard : this.currentTheme.card;
  }

  get weatherCardTextTheme(): string {
    return this.useLightWeatherText ? 'text-white' : 'text-slate-950';
  }

  get mutedWeatherTextTheme(): string {
    return this.useLightWeatherText ? 'text-white/70' : 'text-slate-800/80';
  }

  get subtleWeatherTextTheme(): string {
    return this.useLightWeatherText ? 'text-white/60' : 'text-slate-700/75';
  }

  get translucentPanelTheme(): string {
    return this.isDarkMode
      ? 'bg-white/15 text-white'
      : 'bg-white/55 text-slate-950 ring-1 ring-white/50';
  }

  get translucentChipTheme(): string {
    return this.isDarkMode
      ? 'bg-white/20 text-white hover:bg-white/30'
      : 'bg-white/70 text-slate-950 shadow-sm ring-1 ring-white/50 hover:bg-white/90';
  }

  get cityTitle(): string {
    if (!this.weatherData) {
      return 'Search for a city';
    }

    return `${this.weatherData.cityName}, ${this.weatherData.countryCode}`;
  }

  get lastUpdated(): string {
    if (!this.weatherData?.updatedAt) {
      return '';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(this.weatherData.updatedAt));
  }

  get isCurrentCityFavorite(): boolean {
    if (!this.weatherData) {
      return false;
    }

    const currentCity = this.normalizeCity(this.weatherData.cityName);
    return this.favoriteCities.some((city) => this.normalizeCity(city) === currentCity);
  }

  get favoriteIcon(): string {
    return this.isCurrentCityFavorite
      ? 'assets/icons/star-filled.svg'
      : 'assets/icons/star.svg';
  }

  get favoriteButtonLabel(): string {
    return this.isCurrentCityFavorite ? 'Remove from favorites' : 'Add to favorites';
  }

  getWeatherIcon(weatherType: WeatherType): string {
    const icon = WEATHER_THEMES[weatherType]?.icon || WEATHER_THEMES.cloudy.icon;
    return `${icon}?${ICON_VERSION}`;
  }

  searchWeather(): void {
    const city = this.searchTerm.trim();

    if (!city) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.weatherService.getWeatherByCity(city).subscribe({
      next: (weather) => this.applyWeatherData(weather),
      error: (error) => {
        this.errorMessage = error.message;
        this.selectedLocation = null;
        this.isLoading = false;
      }
    });
  }

  searchFavoriteCity(city: string): void {
    this.searchTerm = city;
    this.searchWeather();
  }

  toggleFavoriteCity(): void {
    if (!this.weatherData) {
      return;
    }

    const cityName = this.weatherData.cityName;
    const normalizedCityName = this.normalizeCity(cityName);

    this.favoriteCities = this.isCurrentCityFavorite
      ? this.favoriteCities.filter((city) => this.normalizeCity(city) !== normalizedCityName)
      : [...this.favoriteCities, cityName];

    this.saveFavoriteCities();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(THEME_STORAGE_KEY, this.isDarkMode ? 'dark' : 'light');
  }

  private get useLightWeatherText(): boolean {
    return this.isDarkMode || !BRIGHT_WEATHER_TYPES.has(this.selectedWeather);
  }

  private applyWeatherData(weather: WeatherData): void {
    this.weatherData = weather;
    this.forecast = weather.forecast;
    this.selectedWeather = weather.weatherType;
    this.selectedLocation = this.getWeatherLocation(weather);
    this.isLoading = false;
  }

  private getWeatherLocation(weather: WeatherData): WeatherMapLocation | null {
    const { latitude: lat, longitude: lon } = weather;

    if (!this.isValidCoordinates(lat, lon)) {
      return null;
    }

    return {
      lat,
      lon,
      label: `${weather.cityName}, ${weather.countryCode}`
    };
  }

  private isValidCoordinates(lat: unknown, lon: unknown): lat is number {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  private loadFavoriteCities(): string[] {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!storedFavorites) {
      return [];
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites);

      if (!Array.isArray(parsedFavorites)) {
        return [];
      }

      return parsedFavorites.filter(
        (city): city is string =>
          typeof city === 'string' && city.trim().length > 0
      );
    } catch {
      return [];
    }
  }

  private saveFavoriteCities(): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favoriteCities));
  }

  private normalizeCity(city: string): string {
    return city
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
