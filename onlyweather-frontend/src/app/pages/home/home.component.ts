import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherMapComponent, WeatherMapLocation } from '../../features/weather-map/weather-map.component';
import { ForecastDay, WeatherData, WeatherService, WeatherType } from '../../core/services/weather.service';

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

  private readonly favoritesStorageKey = 'onlyweather-favorite-cities';
  private readonly iconVersion = 'v=3';

  favoriteCities: string[] = this.loadFavoriteCities();

  isDarkMode = localStorage.getItem('onlyweather-theme') === 'dark';

  themes: Record<WeatherType, WeatherTheme> = {
    sunny: {
      label: 'Sunny',
      condition: 'Sunny',
      icon: 'assets/weather-icons/sunny.svg',
      background: 'from-yellow-200 via-orange-200 to-sky-300',
      card: 'from-yellow-400/90 to-orange-500/90',
      darkBackground: 'from-yellow-950 via-orange-950 to-slate-950',
      darkCard: 'from-yellow-700/80 via-orange-800/85 to-slate-950'
    },

    'partly-cloudy': {
      label: 'Partly cloudy',
      condition: 'Partly cloudy',
      icon: 'assets/weather-icons/partly-cloudy.svg',
      background: 'from-sky-200 via-blue-200 to-indigo-300',
      card: 'from-sky-400/90 to-indigo-500/90',
      darkBackground: 'from-sky-950 via-blue-950 to-indigo-950',
      darkCard: 'from-sky-700/75 via-blue-800/80 to-indigo-950'
    },

    cloudy: {
      label: 'Cloudy',
      condition: 'Cloudy',
      icon: 'assets/weather-icons/cloudy.svg',
      background: 'from-slate-300 via-slate-400 to-slate-500',
      card: 'from-slate-500/90 to-slate-700/90',
      darkBackground: 'from-slate-800 via-slate-900 to-black',
      darkCard: 'from-slate-600/70 via-slate-800/85 to-slate-950'
    },

    rainy: {
      label: 'Rainy',
      condition: 'Rainy',
      icon: 'assets/weather-icons/rainy.svg',
      background: 'from-blue-300 via-slate-500 to-slate-700',
      card: 'from-blue-600/90 to-slate-800/90',
      darkBackground: 'from-blue-950 via-slate-950 to-black',
      darkCard: 'from-blue-800/75 via-slate-900/85 to-black'
    },

    'heavy-rain': {
      label: 'Heavy rain',
      condition: 'Heavy rain',
      icon: 'assets/weather-icons/heavy-rain.svg',
      background: 'from-slate-700 via-gray-900 to-black',
      card: 'from-gray-800/95 to-black/95',
      darkBackground: 'from-purple-950 via-slate-950 to-black',
      darkCard: 'from-purple-900/70 via-slate-900/90 to-black'
    },

    night: {
      label: 'Night',
      condition: 'Night',
      icon: 'assets/weather-icons/night.svg',
      background: 'from-slate-900 via-indigo-950 to-black',
      card: 'from-slate-800/90 via-indigo-900/90 to-black/95',
      darkBackground: 'from-slate-950 via-indigo-950 to-black',
      darkCard: 'from-slate-900/85 via-indigo-950/90 to-black'
    },

    'rainy-night': {
      label: 'Rainy night',
      condition: 'Rainy night',
      icon: 'assets/weather-icons/rainy-night.svg',
      background: 'from-slate-900 via-blue-950 to-black',
      card: 'from-blue-900/85 via-slate-900/90 to-black',
      darkBackground: 'from-blue-950 via-slate-950 to-black',
      darkCard: 'from-blue-950/80 via-slate-950/90 to-black'
    },

    'stormy-night': {
      label: 'Stormy night',
      condition: 'Stormy night',
      icon: 'assets/weather-icons/stormy-night.svg',
      background: 'from-purple-950 via-slate-950 to-black',
      card: 'from-purple-900/80 via-slate-900/90 to-black',
      darkBackground: 'from-purple-950 via-black to-slate-950',
      darkCard: 'from-purple-950/85 via-black/95 to-slate-950'
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
      ? 'bg-black/30 border-white/10 text-white'
      : 'bg-white/45 border-white/50 text-slate-950';
  }

  get weatherCardTheme(): string {
    return this.isDarkMode
      ? this.currentTheme.darkCard
      : this.currentTheme.card;
  }

  get weatherCardTextTheme(): string {
    if (this.isDarkMode || !this.isBrightWeatherCard) {
      return 'text-white';
    }

    return 'text-slate-950';
  }

  get mutedWeatherTextTheme(): string {
    if (this.isDarkMode || !this.isBrightWeatherCard) {
      return 'text-white/70';
    }

    return 'text-slate-800/80';
  }

  get subtleWeatherTextTheme(): string {
    if (this.isDarkMode || !this.isBrightWeatherCard) {
      return 'text-white/60';
    }

    return 'text-slate-700/75';
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
    return this.isCurrentCityFavorite ? 'Remove from favorites' : 'Add to favorites';
  }

  private get isBrightWeatherCard(): boolean {
    return (
      this.selectedWeather === 'sunny' || this.selectedWeather === 'partly-cloudy'
    );
  }

  getWeatherIcon(weatherType: WeatherType): string {
    const icon = this.themes[weatherType]?.icon || this.themes.cloudy.icon;
    return `${icon}?${this.iconVersion}`;
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
        this.selectedLocation = this.getWeatherLocation(weather);
        this.isLoading = false;
      },
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

    if (this.isCurrentCityFavorite) {
      this.favoriteCities = this.favoriteCities.filter((city) => this.normalizeCity(city) !== this.normalizeCity(cityName));
    } else {
      this.favoriteCities = [...this.favoriteCities, cityName];
    }

    this.saveFavoriteCities();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    localStorage.setItem('onlyweather-theme', this.isDarkMode ? 'dark' : 'light');
  }

  private getWeatherLocation(weather: WeatherData): WeatherMapLocation | null {
    const lat = weather.latitude;
    const lon = weather.longitude;

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
    return (typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180);
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
