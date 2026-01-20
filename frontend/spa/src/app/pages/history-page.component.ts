import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Historique (UC-04)</h2>

    <section class="card">
      <div class="row">
        <label>
          Point
          <input [(ngModel)]="pointId" />
        </label>
        <label>
          Type
          <select [(ngModel)]="type">
            <option value="PRESSURE">PRESSURE</option>
            <option value="LEVEL">LEVEL</option>
            <option value="FLOW">FLOW</option>
          </select>
        </label>
        <label>
          From (ISO)
          <input [(ngModel)]="from" />
        </label>
        <label>
          To (ISO)
          <input [(ngModel)]="to" />
        </label>
      </div>
      <button class="btn" (click)="load()">Charger</button>
    </section>

    <div class="table-wrap" *ngIf="data?.length">
      <table class="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Sensor</th>
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

    <p class="muted" *ngIf="data && data.length === 0">Pas de données sur cette période.</p>
  `,
  styles: []
})
export class HistoryPageComponent {
  pointId = 'POINT-001';
  type = 'PRESSURE' as 'PRESSURE' | 'FLOW' | 'LEVEL';
  from = new Date(Date.now() - 1000 * 60 * 60).toISOString();
  to = new Date().toISOString();

  data: any;

  constructor(private readonly api: BffApiService) {}

  load() {
    this.api.history(this.pointId, this.type, this.from, this.to).subscribe((d) => (this.data = d));
  }
}
