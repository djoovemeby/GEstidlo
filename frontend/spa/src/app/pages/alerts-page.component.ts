import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ToastService } from '../ui/toast.service';
import { I18nService } from '../i18n/i18n.service';
import { PointsService } from '../points.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, RouterLink],
  template: `
    <h2>{{ 'alerts.title' | t }}</h2>

    <div class="row">
      <label>
        {{ 'alerts.assignee' | t }}
        <input [(ngModel)]="assignee" />
      </label>
      <button class="btn btn--secondary" (click)="reload()">{{ 'common.refresh' | t }}</button>
    </div>

    <table class="table" *ngIf="alerts?.length">
      <thead>
        <tr>
          <th>{{ 'table.id' | t }}</th>
          <th>{{ 'table.point' | t }}</th>
          <th>{{ 'table.type' | t }}</th>
          <th>{{ 'table.severity' | t }}</th>
          <th>{{ 'table.status' | t }}</th>
          <th>{{ 'table.message' | t }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of alerts">
          <td>{{ a.id }}</td>
          <td>
            <a [routerLink]="['/points', a.pointId]" style="font-weight: 900; text-decoration: none">
              {{ pointLabel(a.pointId) }}
            </a>
            <div class="muted"><code>{{ a.pointId }}</code></div>
          </td>
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
            <button class="btn btn--secondary" (click)="ack(a.id)">{{ 'alerts.ack' | t }}</button>
            <button class="btn" (click)="createTicket(a.id)">{{ 'alerts.createTicket' | t }}</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="alerts && alerts.length === 0">{{ 'alerts.noneActive' | t }}</p>
  `,
  styles: []
})
export class AlertsPageComponent {
  alerts: any[] = [];
  assignee = 'tech';

  constructor(
    private readonly api: BffApiService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService,
    private readonly points: PointsService
  ) {
    this.reload();
  }

  pointLabel(pointId: string): string {
    return this.points.label(pointId);
  }

  reload() {
    this.api.alerts('ACTIVE').subscribe((a) => (this.alerts = a));
  }

  ack(id: number) {
    this.api.ackAlert(id).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('toast.alertAck'));
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  createTicket(alertId: number) {
    this.api.createTicket(alertId, this.assignee).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('toast.ticketCreated'));
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }
}
