import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BffApiService } from '../api/bff-api.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ToastService } from '../ui/toast.service';
import { I18nService } from '../i18n/i18n.service';
import { ProfileService } from '../profile.service';
import { PointsService } from '../points.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, RouterLink],
  template: `
    <h2>{{ 'tickets.title' | t }}</h2>

    <section class="card">
      <div class="row">
        <label>
          {{ 'profile.technicianName' | t }}
          <input [(ngModel)]="technician" (ngModelChange)="saveTechnician()" />
        </label>
        <label>
          Vue
          <select [(ngModel)]="viewMode">
            <option value="all">{{ 'tickets.view.all' | t }}</option>
            <option value="mine">{{ 'tickets.view.mine' | t }}</option>
          </select>
        </label>
        <button class="btn btn--secondary" (click)="reload()">{{ 'common.refresh' | t }}</button>
      </div>
    </section>

    <table class="table" *ngIf="tickets?.length">
      <thead>
        <tr>
          <th>{{ 'table.id' | t }}</th>
          <th>{{ 'table.status' | t }}</th>
          <th>{{ 'table.alert' | t }}</th>
          <th>{{ 'table.point' | t }}</th>
          <th>{{ 'table.technician' | t }}</th>
          <th>{{ 'table.workflow' | t }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filteredTickets()">
          <td>{{ t.id }}</td>
          <td>
            <span
              class="badge"
              [class.badge--ok]="t.status === 'CLOSED'"
              [class.badge--warn]="t.status === 'OPEN' || t.status === 'ASSIGNED'"
              [class.badge--crit]="t.status === 'IN_PROGRESS'"
              >{{ statusKey(t.status) | t }}</span
            >
          </td>
          <td>{{ t.alertId }}</td>
          <td>
            <a [routerLink]="['/points', t.pointId]" style="font-weight: 900; text-decoration: none" *ngIf="t.pointId">
              {{ pointLabel(t.pointId) }}
            </a>
            <div class="muted" *ngIf="t.pointId"><code>{{ t.pointId }}</code></div>
          </td>
          <td>{{ t.assignee || '-' }}</td>
          <td>
            <code *ngIf="t.camundaProcessInstanceId" [title]="t.camundaProcessInstanceId">
              {{ shortId(t.camundaProcessInstanceId) }}
            </code>
            <span *ngIf="!t.camundaProcessInstanceId">-</span>
          </td>
          <td class="actions-cell">
            <div class="actions actions--table">
              <button
                class="btn btn--secondary"
                (click)="takeOver(t.id)"
                [disabled]="t.status === 'CLOSED' || (t.assignee ?? '') === technician"
              >
                {{ 'tickets.takeOver' | t }}
              </button>
              <button
                class="btn"
                [class.btn--danger]="t.status === 'IN_PROGRESS'"
                [disabled]="t.status === 'CLOSED'"
                (click)="advance(t)"
              >
                {{ actionLabel(t.status) | t }}
              </button>

              <a
                class="btn btn--secondary"
                *ngIf="t.camundaProcessInstanceId"
                [href]="cockpitUrl(t.camundaProcessInstanceId)"
                target="_blank"
                >{{ 'tickets.openCockpit' | t }}</a
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="tickets && tickets.length === 0">{{ 'tickets.none' | t }}</p>
  `,
  styles: []
})
export class TicketsPageComponent {
  tickets: any[] = [];
  viewMode: 'all' | 'mine' = 'all';
  technician: string;

  constructor(
    private readonly api: BffApiService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService,
    private readonly profile: ProfileService,
    private readonly points: PointsService
  ) {
    this.technician = this.profile.getTechnicianName();
    this.reload();
  }

  reload() {
    this.api.tickets().subscribe((t) => (this.tickets = t));
  }

  saveTechnician() {
    this.profile.setTechnicianName(this.technician);
  }

  filteredTickets(): any[] {
    if (this.viewMode === 'all') {
      return this.tickets;
    }
    return this.tickets.filter((t) => (t.assignee ?? '') === this.technician);
  }

  pointLabel(pointId: string): string {
    return this.points.label(pointId);
  }

  takeOver(id: number) {
    this.api.assignTicket(id, this.technician).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('toast.ticketAdvanced'));
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  cockpitUrl(processInstanceId: string) {
    return `http://localhost:9080/camunda/app/cockpit/default/#/process-instance/${processInstanceId}`;
  }

  actionLabel(status: string): string {
    if (status === 'OPEN') return 'tickets.start';
    if (status === 'IN_PROGRESS') return 'tickets.close';
    return 'tickets.advance';
  }

  shortId(id?: string): string {
    if (!id) return '-';
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}…${id.slice(-4)}`;
  }

  statusKey(status: string): string {
    return `status.${status}`;
  }

  advance(ticket: any) {
    this.api.advanceTicket(ticket.id).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('toast.ticketAdvanced'));
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }
}
