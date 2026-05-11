import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';

export interface WeatherMapLocation {
  lat: number;
  lon: number;
  label?: string;
}

interface RainViewerResponse {
  host: string;
  radar?: {
    past?: Array<{ path: string; time: number }>;
  };
}

const MAP_CONFIG = {
  initialZoom: 2,
  locationZoom: 8,
  radarRefreshMs: 10 * 60 * 1000,
  radarApiUrl: 'https://api.rainviewer.com/public/weather-maps.json',
  baseMapUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
};

@Component({
  selector: 'app-weather-map',
  standalone: true,
  templateUrl: './weather-map.component.html',
  styleUrls: ['./weather-map.component.css']
})
export class WeatherMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() location: WeatherMapLocation | null = null;

  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  radarStatus = 'Loading radar';
  radarUnavailable = false;
  isExpanded = false;
  radarDetails = 'Fetching latest precipitation frame';
  lastRadarUpdate = '';

  private map?: L.Map;
  private radarLayer?: L.TileLayer;
  private locationMarker?: L.Marker;
  private radarTimer?: ReturnType<typeof setInterval>;
  private currentRadarPath?: string;

  ngAfterViewInit(): void {
    this.initMap();
    this.resolveInitialLocation();
    this.updateRadar();

    this.radarTimer = setInterval(() => {
      this.updateRadar();
    }, MAP_CONFIG.radarRefreshMs);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map || !changes['location'] || !this.location) {
      return;
    }

    this.setLocation(this.location);
  }

  ngOnDestroy(): void {
    if (this.radarTimer) {
      clearInterval(this.radarTimer);
    }

    this.map?.remove();
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.isExpanded) {
      this.closeExpanded();
    }
  }

  openExpanded(): void {
    if (this.isExpanded) {
      return;
    }

    this.isExpanded = true;
    this.invalidateMapSoon();
  }

  closeExpanded(event?: Event): void {
    event?.stopPropagation();
    this.isExpanded = false;
    this.invalidateMapSoon();
  }

  get locationLabel(): string {
    return this.location?.label || 'Current view';
  }

  get coordinatesLabel(): string {
    if (!this.location) {
      return 'Location not selected';
    }

    return `${this.location.lat.toFixed(4)}, ${this.location.lon.toFixed(4)}`;
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: true
    });

    L.tileLayer(MAP_CONFIG.baseMapUrl, {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.map.setView([0, 0], MAP_CONFIG.initialZoom);

    this.invalidateMapSoon();
  }

  private resolveInitialLocation(): void {
    if (this.location) {
      this.setLocation(this.location);
      return;
    }

    this.useBrowserLocation();
  }

  private useBrowserLocation(): void {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.setLocation({
          lat: coords.latitude,
          lon: coords.longitude,
          label: 'My location'
        });
      },
      () => {
        this.locationMarker?.remove();
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  }

  private setLocation(location: WeatherMapLocation): void {
    if (!this.map || !this.isValidLocation(location)) {
      return;
    }

    const coordinates: L.LatLngExpression = [location.lat, location.lon];
    const label = location.label || 'Selected location';

    this.locationMarker?.remove();
    this.map.setView(coordinates, MAP_CONFIG.locationZoom);

    this.locationMarker = L.marker(coordinates, {
      icon: this.locationIcon(),
      title: label
    })
      .addTo(this.map)
      .bindPopup(label)
      .on('click', () => {
        this.map?.setView(coordinates, MAP_CONFIG.locationZoom);
        this.locationMarker?.openPopup();
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

  private async updateRadar(): Promise<void> {
    if (!this.map) {
      return;
    }

    try {
      const response = await fetch(MAP_CONFIG.radarApiUrl);

      if (!response.ok) {
        throw new Error('Radar request failed');
      }

      const data: RainViewerResponse = await response.json();
      const frames = data.radar?.past ?? [];
      const latestFrame = frames[frames.length - 1];

      if (!latestFrame) {
        throw new Error('No radar frames found');
      }

      if (latestFrame.path !== this.currentRadarPath) {
        this.currentRadarPath = latestFrame.path;

        this.renderRadar(
          `${data.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
        );
      }

      this.setRadarStatus('Radar updated');
      this.setRadarDetails(frames.length, latestFrame.time);
    } catch {
      this.setRadarStatus('Radar unavailable', true);
      this.radarDetails = 'Precipitation layer could not be loaded';
      this.lastRadarUpdate = '';
    }
  }

  private renderRadar(url: string): void {
    if (!this.map) {
      return;
    }

    this.radarLayer?.remove();

    this.radarLayer = L.tileLayer(url, {
      opacity: 0.65,
      tileSize: 256,
      maxZoom: 10,
      maxNativeZoom: 7,
      attribution: 'Radar: RainViewer'
    }).addTo(this.map);
  }

  private setRadarStatus(message: string, error = false): void {
    this.radarStatus = message;
    this.radarUnavailable = error;
  }

  private setRadarDetails(frameCount: number, latestFrameTime: number): void {
    this.lastRadarUpdate = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(latestFrameTime * 1000));

    this.radarDetails = `${frameCount} recent precipitation frames loaded`;
  }

  private invalidateMapSoon(): void {
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 80);
  }

  private locationIcon(): L.DivIcon {
    return L.divIcon({
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
}
