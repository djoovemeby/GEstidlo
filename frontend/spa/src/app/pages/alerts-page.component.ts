import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Alertes (UC-06/07)</h2>

    <div class="row">
      <label>
        Assignee (ticket)
        <input [(ngModel)]="assignee" />
      </label>
      <button class="btn btn--secondary" (click)="reload()">Rafraîchir</button>
    </div>

    <table class="table" *ngIf="alerts?.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Point</th>
          <th>Type</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Message</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of alerts">
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
          <td>{{ a.status }}</td>
          <td>{{ a.message }}</td>
          <td class="actions">
            <button class="btn btn--secondary" (click)="ack(a.id)">Ack</button>
            <button class="btn" (click)="createTicket(a.id)">Créer ticket</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="alerts && alerts.length === 0">Aucune alerte ACTIVE.</p>
  `,
  styles: []
})
export class AlertsPageComponent {
  alerts: any[] = [];
  assignee = 'tech';

  constructor(private readonly api: BffApiService) {
    this.reload();
  }

  reload() {
    this.api.alerts('ACTIVE').subscribe((a) => (this.alerts = a));
  }

  ack(id: number) {
    this.api.ackAlert(id).subscribe(() => this.reload());
  }

  createTicket(alertId: number) {
    this.api.createTicket(alertId, this.assignee).subscribe(() => this.reload());
  }
}
