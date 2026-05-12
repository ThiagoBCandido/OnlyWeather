import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SunInfo } from '../../core/services/weather.service';

@Component({
  selector: 'app-sun-cycle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sun-cycle.component.html',
  styleUrl: './sun-cycle.component.css'
})
export class SunCycleComponent {
  @Input() sunInfo: SunInfo | null = null;
  @Input() currentTime: string | null = null;

  get sunriseTime(): string {
    return this.formatTime(this.sunInfo?.sunrise) || '--:--';
  }

  get sunsetTime(): string {
    return this.formatTime(this.sunInfo?.sunset) || '--:--';
  }

  get mainTime(): string {
    return this.sunsetTime;
  }

  get daylightMessage(): string {
    const sunriseMinutes = this.toMinutes(this.sunriseTime);
    const sunsetMinutes = this.toMinutes(this.sunsetTime);
    const currentMinutes = this.getCurrentMinutes();

    if (sunriseMinutes === null || sunsetMinutes === null) {
      return 'Sunlight information unavailable';
    }

    if (currentMinutes < sunriseMinutes) {
      return `Sunrise at ${this.sunriseTime}`;
    }

    if (currentMinutes > sunsetMinutes) {
      return `Sunset ended at ${this.sunsetTime}`;
    }

    const remainingMinutes = sunsetMinutes - currentMinutes;

    return `Daylight remaining: ${this.formatDuration(remainingMinutes)}`;
  }

  get sunProgress(): number {
    const sunriseMinutes = this.toMinutes(this.sunriseTime);
    const sunsetMinutes = this.toMinutes(this.sunsetTime);
    const currentMinutes = this.getCurrentMinutes();

    if (sunriseMinutes === null || sunsetMinutes === null) {
      return 50;
    }

    if (currentMinutes <= sunriseMinutes) {
      return 0;
    }

    if (currentMinutes >= sunsetMinutes) {
      return 100;
    }

    return ((currentMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes)) * 100;
  }

  get sunX(): number {
    return 12 + this.sunProgress * 0.76;
  }

  get sunY(): number {
    const radians = (this.sunProgress / 100) * Math.PI;

    return 62 - Math.sin(radians) * 34;
  }

  private getCurrentMinutes(): number {
    if (this.currentTime) {
      const formattedTime = this.formatTime(this.currentTime);
      const parsedMinutes = this.toMinutes(formattedTime);

      if (parsedMinutes !== null) {
        return parsedMinutes;
      }
    }

    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
  }

  private formatTime(value?: string | null): string {
    if (!value) {
      return '';
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  private toMinutes(value: string): number | null {
    const [hour, minute] = value.split(':').map(Number);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return null;
    }

    return hour * 60 + minute;
  }

  private formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
      return `${minutes}min`;
    }

    return `${hours}h ${minutes}min`;
  }
}