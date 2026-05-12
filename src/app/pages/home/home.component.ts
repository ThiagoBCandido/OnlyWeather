import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ForecastDay,
  WeatherData,
  WeatherService,
  WeatherType
} from '../../core/services/weather.service';

interface WeatherTheme {
  label: string;
  condition: string;
  icon: string;
  background: string;
  card: string;
  darkBackground: string;
  darkCard: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  selectedWeather: WeatherType = 'partly-cloudy';

  searchTerm = 'Ribeirão Preto';

  weatherData: WeatherData | null = null;
  forecast: ForecastDay[] = [];

  isLoading = false;
  errorMessage = '';

  private readonly favoritesStorageKey = 'onlyweather-favorite-cities';

  favoriteCities: string[] = this.loadFavoriteCities();

  isDarkMode = localStorage.getItem('onlyweather-theme') === 'dark';

  themes: Record<WeatherType, WeatherTheme> = {
    sunny: {
      label: 'Ensolarado',
      condition: 'Sunny',
      icon: 'assets/weather-icons/sunny.svg',
      background: 'from-yellow-200 via-orange-200 to-sky-300',
      card: 'from-yellow-400/90 to-orange-500/90',
      darkBackground: 'from-yellow-950 via-orange-950 to-slate-950',
      darkCard: 'from-yellow-700/80 via-orange-800/85 to-slate-950'
    },

    'partly-cloudy': {
      label: 'Parcialmente nublado',
      condition: 'Partly cloudy',
      icon: 'assets/weather-icons/partly-cloudy.svg',
      background: 'from-sky-200 via-blue-200 to-indigo-300',
      card: 'from-sky-400/90 to-indigo-500/90',
      darkBackground: 'from-sky-950 via-blue-950 to-indigo-950',
      darkCard: 'from-sky-700/75 via-blue-800/80 to-indigo-950'
    },

    cloudy: {
      label: 'Nublado',
      condition: 'Cloudy',
      icon: 'assets/weather-icons/cloudy.svg',
      background: 'from-slate-300 via-slate-400 to-slate-500',
      card: 'from-slate-500/90 to-slate-700/90',
      darkBackground: 'from-slate-800 via-slate-900 to-black',
      darkCard: 'from-slate-600/70 via-slate-800/85 to-slate-950'
    },

    rainy: {
      label: 'Chuvoso',
      condition: 'Rainy',
      icon: 'assets/weather-icons/rainy.svg',
      background: 'from-blue-300 via-slate-500 to-slate-700',
      card: 'from-blue-600/90 to-slate-800/90',
      darkBackground: 'from-blue-950 via-slate-950 to-black',
      darkCard: 'from-blue-800/75 via-slate-900/85 to-black'
    },

    'heavy-rain': {
      label: 'Chuva intensa',
      condition: 'Heavy rain',
      icon: 'assets/weather-icons/heavy-rain.svg',
      background: 'from-slate-700 via-gray-900 to-black',
      card: 'from-gray-800/95 to-black/95',
      darkBackground: 'from-purple-950 via-slate-950 to-black',
      darkCard: 'from-purple-900/70 via-slate-900/90 to-black'
    }
  };

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.searchWeather();
  }

  get currentTheme(): WeatherTheme {
    return this.themes[this.selectedWeather];
  }

  get themeIcon(): string {
    return this.isDarkMode
      ? 'assets/icons/sun.svg'
      : 'assets/icons/moon.svg';
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
      ? 'bg-black/30 border-white/10'
      : 'bg-white/15 border-white/20';
  }

  get weatherCardTheme(): string {
    return this.isDarkMode
      ? this.currentTheme.darkCard
      : this.currentTheme.card;
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

    return this.favoriteCities.some(
      (city) =>
        this.normalizeCity(city) ===
        this.normalizeCity(this.weatherData!.cityName)
    );
  }

  get favoriteIcon(): string {
    return this.isCurrentCityFavorite
      ? 'assets/icons/star-filled.svg'
      : 'assets/icons/star.svg';
  }

  get favoriteButtonLabel(): string {
    return this.isCurrentCityFavorite
      ? 'Remove from favorites'
      : 'Add to favorites';
  }

  searchWeather(): void {
    const city = this.searchTerm.trim();

    if (!city) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.weatherService.getWeatherByCity(city).subscribe({
      next: (weather) => {
        this.weatherData = weather;
        this.forecast = weather.forecast;
        this.selectedWeather = weather.weatherType;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
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

    if (this.isCurrentCityFavorite) {
      this.favoriteCities = this.favoriteCities.filter(
        (city) => this.normalizeCity(city) !== this.normalizeCity(cityName)
      );
    } else {
      this.favoriteCities = [...this.favoriteCities, cityName];
    }

    this.saveFavoriteCities();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem(
      'onlyweather-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }

  private loadFavoriteCities(): string[] {
    const storedFavorites = localStorage.getItem(this.favoritesStorageKey);

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
    localStorage.setItem(
      this.favoritesStorageKey,
      JSON.stringify(this.favoriteCities)
    );
  }

  private normalizeCity(city: string): string {
    return city
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
