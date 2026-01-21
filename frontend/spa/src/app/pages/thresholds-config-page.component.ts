import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';

import { BffApiService } from '../api/bff-api.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { MeasurementTypesService } from '../measurement-types.service';
import { ToastService } from '../ui/toast.service';

type ThresholdRow = {
  type: string;
  minWarn: number | null;
  minCrit: number | null;
};

@Component({
  selector: 'app-thresholds-config-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'reference.thresholds.title' | t }}</h2>

    <section class="card">
      <div class="muted" style="margin-top: -0.25rem">
        {{ 'reference.thresholds.minWarn' | t }} / {{ 'reference.thresholds.minCrit' | t }}
      </div>

      <div class="table-wrap" style="margin-top: 0.75rem">
        <table class="table">
          <thead>
            <tr>
              <th>{{ 'table.type' | t }}</th>
              <th>{{ 'reference.thresholds.minWarn' | t }}</th>
              <th>{{ 'reference.thresholds.minCrit' | t }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows">
              <td style="font-weight: 900">{{ typeLabel(r.type) }}</td>
              <td style="max-width: 10rem">
                <input type="number" [(ngModel)]="r.minWarn" placeholder="—" />
              </td>
              <td style="max-width: 10rem">
                <input type="number" [(ngModel)]="r.minCrit" placeholder="—" />
              </td>
              <td class="actions-cell">
                <div class="actions actions--table">
                  <button class="btn btn--secondary" (click)="save(r)">{{ 'common.save' | t }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ThresholdsConfigPageComponent implements OnDestroy {
  rows: ThresholdRow[] = [];

  private sub?: Subscription;

  constructor(
    private readonly api: BffApiService,
    private readonly measurementTypes: MeasurementTypesService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.measurementTypes.ensureLoaded().subscribe();

    this.sub = combineLatest([this.measurementTypes.stream(), this.api.referenceThresholds()]).subscribe({
      next: ([types, thresholds]) => {
        const activeTypes = (types ?? []).filter((t) => t.active).map((t) => t.code);
        const byType = new Map<string, { minWarn: number | null; minCrit: number | null }>();
        for (const row of (thresholds ?? []) as any[]) {
          byType.set(String(row.type), {
            minWarn: typeof row.minWarn === 'number' ? row.minWarn : row.minWarn ?? null,
            minCrit: typeof row.minCrit === 'number' ? row.minCrit : row.minCrit ?? null
          });
        }

        this.rows = activeTypes.map((t) => {
          const existing = byType.get(t);
          return {
            type: t,
            minWarn: existing?.minWarn ?? null,
            minCrit: existing?.minCrit ?? null
          };
        });
      },
      error: () => {
        this.toast.push('error', this.i18n.t('toast.failed'));
      }
    });
  }

  typeLabel(type: string): string {
    return this.measurementTypes.label(type);
  }

  save(r: ThresholdRow) {
    const minWarn = r.minWarn === null || r.minWarn === undefined || Number.isNaN(r.minWarn) ? null : Number(r.minWarn);
    const minCrit = r.minCrit === null || r.minCrit === undefined || Number.isNaN(r.minCrit) ? null : Number(r.minCrit);

    this.api.upsertThreshold(r.type, { minWarn, minCrit }).subscribe({
      next: () => this.toast.push('success', this.i18n.t('common.saved')),
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || this.i18n.t('toast.failed');
        this.toast.push('error', msg);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

