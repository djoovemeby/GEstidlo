import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BffApiService } from '../api/bff-api.service';

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Tickets (UC-08)</h2>

    <button class="btn btn--secondary" (click)="reload()">Rafraîchir</button>

    <table class="table" *ngIf="tickets?.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Alert</th>
          <th>Assignee</th>
          <th>Camunda PID</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of tickets">
          <td>{{ t.id }}</td>
          <td>
            <span
              class="badge"
              [class.badge--ok]="t.status === 'CLOSED'"
              [class.badge--warn]="t.status === 'OPEN' || t.status === 'ASSIGNED'"
              [class.badge--crit]="t.status === 'IN_PROGRESS'"
              >{{ t.status }}</span
            >
          </td>
          <td>{{ t.alertId }}</td>
          <td>{{ t.assignee }}</td>
          <td><code>{{ t.camundaProcessInstanceId }}</code></td>
          <td class="actions">
            <button class="btn" (click)="advance(t.id)">Avancer workflow</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="tickets && tickets.length === 0">Aucun ticket.</p>
  `,
  styles: []
})
export class TicketsPageComponent {
  tickets: any[] = [];

  constructor(private readonly api: BffApiService) {
    this.reload();
  }

  reload() {
    this.api.tickets().subscribe((t) => (this.tickets = t));
  }

  advance(id: number) {
    this.api.advanceTicket(id).subscribe(() => this.reload());
  }
}
