import { WeatherType } from '../../core/services/weather.service';

export interface WeatherTheme {
  label: string;
  condition: string;
  icon: string;
  background: string;
  card: string;
  darkBackground: string;
  darkCard: string;
}

export const WEATHER_THEMES: Record<WeatherType, WeatherTheme> = {
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

export const BRIGHT_WEATHER_TYPES: ReadonlySet<WeatherType> = new Set([
  'sunny',
  'partly-cloudy'
]);
