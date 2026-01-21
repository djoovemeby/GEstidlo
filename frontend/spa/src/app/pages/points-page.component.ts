import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PointsService } from '../points.service';
import { BffApiService } from '../api/bff-api.service';
import { RefreshService } from '../refresh.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../ui/toast.service';
import { I18nService } from '../i18n/i18n.service';
import { CodeItemDto, MeasurementTypesService } from '../measurement-types.service';

type RealtimePointDto = {
  pointId: string;
  lastMeasurements: Record<string, { value: number; unit: string; timestamp: string } | undefined>;
};

@Component({
  selector: 'app-points-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <h2>{{ 'points.title' | t }}</h2>

    <section class="card">
      <div class="empty-state" *ngIf="!hasAnyRealtime()">
        <div>
          <div class="empty-title">{{ 'dashboard.noPoints' | t }}</div>
          <div class="muted">{{ 'empty.tip.simulation' | t }}</div>
        </div>
        <a class="btn btn--secondary" routerLink="/dashboard">{{ 'empty.openDashboard' | t }}</a>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ 'table.point' | t }}</th>
              <th>{{ 'table.id' | t }}</th>
              <th *ngFor="let t of measurementTypeList">{{ typeLabel(t.code) }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of points">
              <td style="font-weight: 900">{{ p.name }}</td>
              <td class="muted"><code>{{ p.id }}</code></td>
              <td *ngFor="let t of measurementTypeList">{{ value(p.id, t.code) }}</td>
              <td class="actions-cell">
                <div class="actions actions--table">
                  <a class="btn btn--secondary" [routerLink]="['/points', p.id]">{{ 'points.open' | t }}</a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class PointsPageComponent implements OnDestroy {
  points = [] as ReturnType<PointsService['all']>;
  realtime: Record<string, RealtimePointDto> = {};
  measurementTypeList: CodeItemDto[] = [];

  private refreshSubscription?: Subscription;
  private measurementTypesSubscription?: Subscription;
  private pointsSubscription?: Subscription;

  constructor(
    private readonly pointsService: PointsService,
    private readonly api: BffApiService,
    private readonly measurementTypes: MeasurementTypesService,
    private readonly refresh: RefreshService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.pointsService.ensureLoaded().subscribe();
    this.pointsSubscription = this.pointsService.stream().subscribe(() => {
      this.points = this.pointsService.all();
    });

    this.measurementTypes.ensureLoaded().subscribe();
    this.measurementTypesSubscription = this.measurementTypes.stream().subscribe((types) => {
      this.measurementTypeList = (types ?? []).filter((t) => t.active);
    });

    this.reload();

    this.refreshSubscription = this.refresh.refresh$.subscribe((e) => this.reload(e.reason === 'manual'));
  }

  reload(showErrorToast = false) {
    // utilise l'endpoint realtime déjà existant; sans filtre => points actifs côté backend.
    this.api.realtimePoints().subscribe({
      next: (rows: RealtimePointDto[]) => {
        this.realtime = Object.fromEntries(rows.map((r) => [r.pointId, r]));
      },
      error: () => {
        if (showErrorToast) {
          this.realtime = {};
          // pas de toast en boucle pendant l'auto-refresh
          this.toast.push('error', this.i18n.t('toast.failed'));
        }
      }
    });
  }

  value(pointId: string, type: string): string {
    const p = this.realtime[pointId];
    const m = p?.lastMeasurements[type];
    if (!m) return '-';
    return `${m.value} ${m.unit}`;
  }

  typeLabel(type: string): string {
    return this.measurementTypes.label(type);
  }

  hasAnyRealtime(): boolean {
    return Object.keys(this.realtime).length > 0;
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.measurementTypesSubscription?.unsubscribe();
    this.pointsSubscription?.unsubscribe();
  }
}
