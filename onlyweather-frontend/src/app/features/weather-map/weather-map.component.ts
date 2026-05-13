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
    past?: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
}

interface RainViewerFrame {
  path: string;
  time: number;
}

interface RadarFrame {
  path: string;
  time: number;
  kind: 'past' | 'forecast';
}

const MAP_CONFIG = {
  initialZoom: 2,
  locationZoom: 8,
  radarRefreshMs: 10 * 60 * 1000,
  radarApiUrl: 'https://api.rainviewer.com/public/weather-maps.json',
  lightMapUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  lightMapAttribution: '&copy; OpenStreetMap contributors',
  darkMapUrl:
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  darkMapAttribution:
    '&copy; OpenStreetMap contributors &copy; CARTO'
};

@Component({
  selector: 'app-weather-map',
  standalone: true,
  templateUrl: './weather-map.component.html',
  styleUrls: ['./weather-map.component.css']
})
export class WeatherMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() location: WeatherMapLocation | null = null;
  @Input() isDarkMode = false;

  @ViewChild('mapContainer', { static: true })
  private mapContainer!: ElementRef<HTMLDivElement>;

  radarStatus = 'Loading radar';
  radarUnavailable = false;
  isExpanded = false;
  radarDetails = 'Fetching latest precipitation frame';
  lastRadarUpdate = '';

  private map?: L.Map;
  private baseLayer?: L.TileLayer;
  private radarLayer?: L.TileLayer;
  private locationMarker?: L.Marker;
  private radarTimer?: ReturnType<typeof setInterval>;
  private currentRadarPath?: string;
  private radarHost = '';
  private currentFrame?: RadarFrame;

  ngAfterViewInit(): void {
    this.initMap();
    this.resolveInitialLocation();
    this.updateRadar();

    this.radarTimer = setInterval(() => {
      this.updateRadar();
    }, MAP_CONFIG.radarRefreshMs);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }

    if (changes['isDarkMode']) {
      this.updateBaseLayer();
    }

    if (changes['location'] && this.location) {
      this.setLocation(this.location);
    }
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
    return this.location?.label || 'Waiting for city';
  }

  get coordinatesLabel(): string {
    if (!this.location) {
      return 'Location not selected';
    }

    return `${this.location.lat.toFixed(4)}, ${this.location.lon.toFixed(4)}`;
  }

  get frameTimeLabel(): string {
    if (!this.currentFrame) {
      return '--:--';
    }

    return this.formatRadarTime(this.currentFrame.time);
  }

  get frameTypeLabel(): string {
    return this.currentFrame?.kind === 'forecast'
      ? 'Nowcast'
      : 'Observed';
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: true
    });

    this.updateBaseLayer();

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
      const frames = this.getRadarFrames(data);
      const latestFrame = this.getLatestRadarFrame(frames);

      if (!latestFrame) {
        throw new Error('No radar frames found');
      }

      this.radarHost = data.host;
      this.currentFrame = latestFrame;
      this.renderCurrentRadarFrame();

      this.setRadarStatus('Radar updated');
      this.setRadarDetails(frames, latestFrame.time);
    } catch {
      this.setRadarStatus('Radar unavailable', true);
      this.radarDetails = 'Precipitation layer could not be loaded';
      this.lastRadarUpdate = '';
    }
  }

  private getRadarFrames(data: RainViewerResponse): RadarFrame[] {
    const pastFrames = this.toRadarFrames(data.radar?.past ?? [], 'past');
    const forecastFrames = this.toRadarFrames(data.radar?.nowcast ?? [], 'forecast');

    return [...pastFrames, ...forecastFrames];
  }

  private toRadarFrames(
    frames: RainViewerFrame[],
    kind: RadarFrame['kind']
  ): RadarFrame[] {
    return frames.map((frame) => ({ ...frame, kind }));
  }

  private getLatestRadarFrame(frames: RadarFrame[]): RadarFrame | undefined {
    return (
      [...frames].reverse().find((frame) => frame.kind === 'past') ??
      frames[frames.length - 1]
    );
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

  private renderCurrentRadarFrame(): void {
    const frame = this.currentFrame;

    if (!frame || !this.radarHost) {
      return;
    }

    if (frame.path === this.currentRadarPath) {
      return;
    }

    this.currentRadarPath = frame.path;
    this.renderRadar(`${this.radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`);
  }

  private updateBaseLayer(): void {
    if (!this.map) {
      return;
    }

    this.baseLayer?.remove();

    this.baseLayer = L.tileLayer(
      this.isDarkMode ? MAP_CONFIG.darkMapUrl : MAP_CONFIG.lightMapUrl,
      {
        maxZoom: 18,
        attribution: this.isDarkMode
          ? MAP_CONFIG.darkMapAttribution
          : MAP_CONFIG.lightMapAttribution
      }
    ).addTo(this.map);

    if (this.radarLayer) {
      this.radarLayer.bringToFront();
    }
  }

  private setRadarStatus(message: string, error = false): void {
    this.radarStatus = message;
    this.radarUnavailable = error;
  }

  private setRadarDetails(frames: RadarFrame[], latestFrameTime: number): void {
    const forecastCount = frames.filter((frame) => frame.kind === 'forecast').length;

    this.lastRadarUpdate = this.formatRadarTime(latestFrameTime);
    this.radarDetails = forecastCount > 0
      ? `${frames.length} radar frames, includes nowcast`
      : `${frames.length} observed radar frames`;
  }

  private formatRadarTime(time: number): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(time * 1000));
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
