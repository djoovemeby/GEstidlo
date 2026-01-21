import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PointsService } from '../points.service';
import { BffApiService } from '../api/bff-api.service';

type RealtimePointDto = {
  pointId: string;
  lastMeasurements: Record<string, { value: number; unit: string; timestamp: string }>;
};

@Component({
  selector: 'app-points-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <h2>{{ 'points.title' | t }}</h2>

    <section class="card">
      <div class="row" style="justify-content: flex-end">
        <button class="btn btn--secondary" (click)="reload()">{{ 'common.refresh' | t }}</button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ 'table.point' | t }}</th>
              <th>Id</th>
              <th>PRESSURE</th>
              <th>LEVEL</th>
              <th>FLOW</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of points">
              <td style="font-weight: 900">{{ p.name }}</td>
              <td class="muted"><code>{{ p.id }}</code></td>
              <td>{{ value(p.id, 'PRESSURE') }}</td>
              <td>{{ value(p.id, 'LEVEL') }}</td>
              <td>{{ value(p.id, 'FLOW') }}</td>
              <td class="actions">
                <a class="btn btn--secondary" [routerLink]="['/points', p.id]">{{ 'points.open' | t }}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class PointsPageComponent {
  points = [] as ReturnType<PointsService['all']>;
  realtime: Record<string, RealtimePointDto> = {};

  constructor(private readonly pointsService: PointsService, private readonly api: BffApiService) {
    this.points = this.pointsService.all();
    this.reload();
  }

  reload() {
    // utilise l'endpoint realtime déjà existant, en fournissant la liste de points.
    const ids = this.points.map((p) => p.id);
    this.api.realtimePoints(ids).subscribe((rows: RealtimePointDto[]) => {
      this.realtime = Object.fromEntries(rows.map((r) => [r.pointId, r]));
    });
  }

  value(pointId: string, type: 'PRESSURE' | 'LEVEL' | 'FLOW'): string {
    const p = this.realtime[pointId];
    const m = p?.lastMeasurements?.[type];
    if (!m) return '-';
    return `${m.value} ${m.unit}`;
  }
}
