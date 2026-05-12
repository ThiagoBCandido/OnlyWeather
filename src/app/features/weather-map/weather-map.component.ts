import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';

export interface WeatherMapLocation {
  lat: number;
  lon: number;
  label?: string;
}

interface WindyApi {
  map: any;
  store: {
    get: (key: string) => any;
    getAllowed: (key: string) => any[] | string;
    set: (key: string, value: any, options?: any) => void;
  };
  picker?: {
    open: (location: { lat: number; lon: number }) => void;
    close: () => void;
  };
}

declare global {
  interface Window {
    windyInit?: (
      options: Record<string, any>,
      callback: (windyApi: WindyApi) => void
    ) => void;
    L?: any;
  }
}

const WINDY_API_KEY = 'lrJf1iUAJd5tiirJSL971T09sfKXjuJr';

const MAP_CONFIG = {
  initialLat: 0,
  initialLon: 0,
  initialZoom: 3,
  locationZoom: 8,
  leafletScriptId: 'windy-leaflet-script',
  windyScriptId: 'windy-map-script',
  leafletScriptUrl: 'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js',
  windyScriptUrl: 'https://api.windy.com/assets/map-forecast/libBoot.js'
};

@Component({
  selector: 'app-weather-map',
  standalone: true,
  templateUrl: './weather-map.component.html',
  styleUrls: ['./weather-map.component.css']
})
export class WeatherMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() location: WeatherMapLocation | null = null;

  @ViewChild('windyContainer', { static: true })
  private windyContainer!: ElementRef<HTMLDivElement>;

  mapStatus = 'Loading Windy map';
  mapUnavailable = false;

  private map?: any;
  private windyApi?: WindyApi;
  private locationMarker?: any;
  private initialized = false;

  async ngAfterViewInit(): Promise<void> {
    await this.initWindyMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['location'] || !this.location || !this.initialized) return;

    this.setLocation(this.location);
  }

  ngOnDestroy(): void {
    this.locationMarker?.remove?.();
    this.locationMarker = undefined;
  }

  private async initWindyMap(): Promise<void> {
    try {
      await this.loadWindyScripts();

      if (!window.windyInit) {
        throw new Error('Windy API was not loaded.');
      }

      const startLocation = this.getStartLocation();

      window.windyInit(
        {
          key: WINDY_API_KEY,
          lat: startLocation.lat,
          lon: startLocation.lon,
          zoom: MAP_CONFIG.initialZoom,
          overlay: 'rain',
          particlesAnim: 'on',
          englishLabels: true,
          lang: 'en',
          verbose: false
        },
        (windyApi) => {
          this.windyApi = windyApi;
          this.map = windyApi.map;
          this.initialized = true;

          this.configurePrecipitationLayer();

          setTimeout(() => {
            this.map?.invalidateSize?.();

            if (this.location) {
              this.setLocation(this.location);
            } else {
              this.useBrowserLocation();
            }
          }, 300);

          this.setMapStatus('Windy precipitation loaded');
        }
      );
    } catch {
      this.setMapStatus('Windy map unavailable', true);
    }
  }

  private getStartLocation(): WeatherMapLocation {
    if (this.location && this.isValidLocation(this.location)) {
      return this.location;
    }

    return {
      lat: MAP_CONFIG.initialLat,
      lon: MAP_CONFIG.initialLon,
      label: 'World view'
    };
  }

  private configurePrecipitationLayer(): void {
    if (!this.windyApi) return;

    const allowedOverlays = this.windyApi.store.getAllowed('overlay');

    if (Array.isArray(allowedOverlays)) {
      if (allowedOverlays.includes('rain')) {
        this.windyApi.store.set('overlay', 'rain');
        return;
      }

      if (allowedOverlays.includes('rainAccu')) {
        this.windyApi.store.set('overlay', 'rainAccu');
        return;
      }

      this.setMapStatus('Rain layer unavailable for this key', true);
      return;
    }

    this.windyApi.store.set('overlay', 'rain', { forceChange: true });
  }

  private useBrowserLocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.setLocation({
          lat: coords.latitude,
          lon: coords.longitude,
          label: 'My location'
        });
      },
      () => {
        this.locationMarker?.remove?.();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  }

  private setLocation(location: WeatherMapLocation): void {
    if (!this.map || !this.isValidLocation(location)) return;

    const label = location.label || 'Selected location';
    const coordinates: [number, number] = [location.lat, location.lon];

    this.map.invalidateSize?.();
    this.map.setView(coordinates, MAP_CONFIG.locationZoom);

    this.locationMarker?.remove?.();

    if (!window.L) return;

    this.locationMarker = window.L.marker(coordinates, {
      icon: this.locationIcon(),
      title: label
    })
      .addTo(this.map)
      .bindPopup(label)
      .on('click', () => {
        this.map?.setView(coordinates, MAP_CONFIG.locationZoom);
        this.locationMarker?.openPopup();

        this.windyApi?.picker?.open({
          lat: location.lat,
          lon: location.lon
        });
      });
  }

  private isValidLocation(location: WeatherMapLocation): boolean {
    const { lat, lon } = location;

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  private locationIcon(): any {
    return window.L.divIcon({
      className: 'location-marker',
      iconSize: [46, 46],
      iconAnchor: [23, 23],
      popupAnchor: [0, -22],
      html: `
        <div class="location-marker-pulse"></div>
        <div class="location-marker-content">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L4.5 21.5L12 17.5L19.5 21.5L12 2Z"></path>
          </svg>
        </div>
      `
    });
  }

  private async loadWindyScripts(): Promise<void> {
    await this.loadScript(
      MAP_CONFIG.leafletScriptUrl,
      MAP_CONFIG.leafletScriptId
    );

    await this.loadScript(
      MAP_CONFIG.windyScriptUrl,
      MAP_CONFIG.windyScriptId
    );
  }

  private loadScript(src: string, id: string): Promise<void> {
    const existingScript = document.getElementById(id);

    if (existingScript) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();

      document.body.appendChild(script);
    });
  }

  private setMapStatus(message: string, error = false): void {
    this.mapStatus = message;
    this.mapUnavailable = error;
  }
}