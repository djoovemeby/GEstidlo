import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';

type AlertDto = {
  id: number;
  pointId: string;
  type: string;
  severity: 'INFO' | 'WARN' | 'CRIT';
  status: string;
  message: string;
};

type TicketDto = {
  id: number;
  status: string;
  alertId?: number;
  assignee?: string;
  camundaProcessInstanceId?: string;
};

type DashboardDto = {
  realtime?: any[];
  alerts?: AlertDto[];
  tickets?: TicketDto[];
  processDefinitions?: any[];
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Dashboard</h2>

    <section class="kpi-grid" *ngIf="dashboard">
      <div class="kpi">
        <div class="kpi-label">Alertes actives</div>
        <div class="kpi-value">{{ dashboard.alerts?.length || 0 }}</div>
        <div class="kpi-sub">UC-07</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Tickets</div>
        <div class="kpi-value">{{ dashboard.tickets?.length || 0 }}</div>
        <div class="kpi-sub">UC-08</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Process déployés</div>
        <div class="kpi-value">{{ dashboard.processDefinitions?.length || 0 }}</div>
        <div class="kpi-sub">Camunda</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Points (realtime)</div>
        <div class="kpi-value">{{ dashboard.realtime?.length || 0 }}</div>
        <div class="kpi-sub">UC-03</div>
      </div>
    </section>

    <section class="card">
      <h3>Simuler une mesure (UC-10)</h3>
      <div class="row">
        <label>
          Point
          <input [(ngModel)]="form.pointId" />
        </label>
        <label>
          Capteur
          <input [(ngModel)]="form.sensorId" />
        </label>
        <label>
          Type
          <select [(ngModel)]="form.type">
            <option value="PRESSURE">PRESSURE</option>
            <option value="LEVEL">LEVEL</option>
            <option value="FLOW">FLOW</option>
          </select>
        </label>
        <label>
          Valeur
          <input type="number" [(ngModel)]="form.value" />
        </label>
        <label>
          Unité
          <input [(ngModel)]="form.unit" />
        </label>
      </div>
      <button class="btn" (click)="send()">Envoyer</button>

      <div *ngIf="lastIngest" class="result">
        <strong>Ingestion:</strong>
        <pre>{{ lastIngest | json }}</pre>
      </div>
    </section>

    <section class="card">
      <h3>Etat agrégé (UC-03/05/07/08)</h3>
      <button class="btn btn--secondary" (click)="reload()">Rafraîchir</button>

      <div *ngIf="dashboard" style="margin-top: 1rem">
        <h4 style="margin: 0 0 0.5rem">Alertes actives</h4>
        <div class="table-wrap" *ngIf="dashboard.alerts?.length">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Point</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of (dashboard.alerts || []).slice(0, 5)">
                <td>{{ a.id }}</td>
                <td>{{ a.pointId }}</td>
                <td>{{ a.type }}</td>
                <td>
                  <span
                    class="badge"
                    [class.badge--crit]="a.severity === 'CRIT'"
                    [class.badge--warn]="a.severity === 'WARN'"
                    [class.badge--ok]="a.severity === 'INFO'"
                    >{{ a.severity }}</span
                  >
                </td>
                <td>{{ a.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted" *ngIf="!dashboard.alerts?.length">Aucune alerte active.</p>

        <h4 style="margin: 1rem 0 0.5rem">Tickets</h4>
        <div class="table-wrap" *ngIf="dashboard.tickets?.length">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Alert</th>
                <th>Assignee</th>
                <th>Camunda PID</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of (dashboard.tickets || []).slice(0, 5)">
                <td>{{ t.id }}</td>
                <td>
                  <span class="badge" [class.badge--ok]="t.status === 'CLOSED'" [class.badge--warn]="t.status !== 'CLOSED'">
                    {{ t.status }}
                  </span>
                </td>
                <td>{{ t.alertId }}</td>
                <td>{{ t.assignee }}</td>
                <td><code>{{ t.camundaProcessInstanceId }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted" *ngIf="!dashboard.tickets?.length">Aucun ticket.</p>

        <details style="margin-top: 1rem">
          <summary class="muted">Voir JSON brut</summary>
          <pre>{{ dashboard | json }}</pre>
        </details>
      </div>
    </section>
  `,
  styles: []
})
export class DashboardPageComponent {
  dashboard?: DashboardDto;
  lastIngest: any;
  form = {
    pointId: 'POINT-001',
    sensorId: 'SENSOR-001',
    type: 'PRESSURE' as 'PRESSURE' | 'FLOW' | 'LEVEL',
    value: 1.5,
    unit: 'bar'
  };

  constructor(private readonly api: BffApiService) {
    this.reload();
  }

  reload() {
    this.api.dashboard().subscribe((d) => (this.dashboard = d as DashboardDto));
  }

  send() {
    this.api.ingestMeasurement(this.form).subscribe((r) => {
      this.lastIngest = r;
      this.reload();
    });
  }
}
