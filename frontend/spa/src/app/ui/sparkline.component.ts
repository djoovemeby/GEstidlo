import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      class="spark"
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      *ngIf="values && values.length >= 2"
      aria-hidden="true"
    >
      <polyline [attr.points]="points" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>
  `,
  styles: [
    `
      .spark {
        width: 100%;
        height: 28px;
        opacity: 0.9;
      }
    `
  ]
})
export class SparklineComponent {
  @Input({ required: true }) values: number[] = [];

  get points(): string {
    const values = this.values;
    if (!values || values.length < 2) {
      return '';
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1e-9, max - min);

    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 24 - ((v - min) / range) * 20;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }
}

