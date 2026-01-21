import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { CodeItemDto, MeasurementTypesService } from '../measurement-types.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'history.title' | t }}</h2>

    <section class="card">
      <div class="row">
        <label>
          {{ 'table.point' | t }}
          <input [(ngModel)]="pointId" />
        </label>
        <label>
          {{ 'table.type' | t }}
          <select [(ngModel)]="type">
            <option *ngFor="let t of measurementTypeList" [value]="t.code">{{ typeLabel(t.code) }}</option>
          </select>
        </label>
        <label>
          {{ 'history.from' | t }}
          <input [(ngModel)]="from" />
        </label>
        <label>
          {{ 'history.to' | t }}
          <input [(ngModel)]="to" />
        </label>
      </div>
      <button class="btn" (click)="load()">{{ 'common.load' | t }}</button>
    </section>

    <div class="table-wrap" *ngIf="data?.length">
      <table class="table">
        <thead>
          <tr>
            <th>{{ 'table.timestamp' | t }}</th>
            <th>{{ 'table.value' | t }}</th>
            <th>{{ 'table.unit' | t }}</th>
            <th>{{ 'table.sensor' | t }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data">
            <td><code>{{ row.timestamp }}</code></td>
            <td style="font-weight: 800">{{ row.value }}</td>
            <td>{{ row.unit }}</td>
            <td><code>{{ row.sensorId }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="muted" *ngIf="data && data.length === 0">{{ 'history.noData' | t }}</p>
  `,
  styles: []
})
export class HistoryPageComponent implements OnDestroy {
  pointId = 'POINT-001';
  type = 'PRESSURE';
  from = new Date(Date.now() - 1000 * 60 * 60).toISOString();
  to = new Date().toISOString();

  measurementTypeList: CodeItemDto[] = [];
  data: any;

  private measurementTypesSubscription?: Subscription;

  constructor(
    private readonly api: BffApiService,
    private readonly measurementTypes: MeasurementTypesService
  ) {
    this.measurementTypes.ensureLoaded().subscribe();
    this.measurementTypesSubscription = this.measurementTypes.stream().subscribe((types) => {
      this.measurementTypeList = (types ?? []).filter((t) => t.active);
      if (!this.measurementTypeList.some((t) => t.code === this.type) && this.measurementTypeList.length > 0) {
        this.type = this.measurementTypeList[0].code;
      }
    });
  }

  load() {
    this.api.history(this.pointId, this.type, this.from, this.to).subscribe((d) => (this.data = d));
  }

  typeLabel(type: string): string {
    return this.measurementTypes.label(type);
  }

  ngOnDestroy(): void {
    this.measurementTypesSubscription?.unsubscribe();
  }
}
