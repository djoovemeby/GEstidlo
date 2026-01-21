import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';
import { TranslatePipe } from '../i18n/translate.pipe';

type ProcessDefinition = {
  id: string;
  key: string;
  name?: string;
  version?: number;
  resource?: string;
};

type CamundaTask = {
  id: string;
  name?: string;
  assignee?: string;
  created?: string;
};

@Component({
  selector: 'app-processes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'processes.title' | t }}</h2>

    <section class="card">
      <div class="row">
        <button class="btn btn--secondary" (click)="reload()">{{ 'common.refresh' | t }}</button>
        <label>
          {{ 'processes.assignee' | t }}
          <input [(ngModel)]="assignee" />
        </label>
      </div>

      <div class="table-wrap" *ngIf="definitions?.length">
        <table class="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Version</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of definitions">
              <td><code>{{ d.key }}</code></td>
              <td>{{ d.name || '-' }}</td>
              <td>{{ d.version || '-' }}</td>
              <td class="actions">
                <button class="btn" (click)="start(d.key)">{{ 'processes.start' | t }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="definitions && definitions.length === 0" class="muted">Aucun process trouvé.</p>
    </section>

    <section class="card">
      <h3>Instance & tâches</h3>

      <div class="row">
        <label>
          {{ 'processes.instance' | t }}
          <input [(ngModel)]="processInstanceId" placeholder="ex: 6109d9a2-f5b0-11f0-a5a1-..." />
        </label>
        <button class="btn btn--secondary" (click)="loadTasks()" [disabled]="!processInstanceId">
          {{ 'processes.loadTasks' | t }}
        </button>
      </div>

      <div class="table-wrap" *ngIf="tasks?.length">
        <table class="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tasks">
              <td>
                <div style="font-weight: 700">{{ t.name || 'Task' }}</div>
                <div class="muted"><code>{{ t.id }}</code></div>
              </td>
              <td>{{ t.assignee || '-' }}</td>
              <td>{{ t.created || '-' }}</td>
              <td class="actions">
                <button class="btn" (click)="complete(t.id)">{{ 'processes.complete' | t }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="tasks && tasks.length === 0" class="muted">Aucune tâche active pour cette instance.</p>
    </section>

    <section class="card" *ngIf="lastStart">
      <h3>Dernier démarrage</h3>
      <pre>{{ lastStart | json }}</pre>
    </section>
  `
})
export class ProcessesPageComponent {
  definitions: ProcessDefinition[] = [];
  tasks: CamundaTask[] = [];
  assignee = 'tech';

  processInstanceId = '';
  lastStart: any;

  constructor(private readonly api: BffApiService) {
    this.reload();
  }

  reload() {
    this.api.processDefinitions().subscribe((defs) => {
      this.definitions = defs;
    });
  }

  start(key: string) {
    this.api.startProcess(key, { assignee: this.assignee }).subscribe((res) => {
      this.lastStart = res;
      if (res?.id) {
        this.processInstanceId = res.id;
        this.loadTasks();
      }
    });
  }

  loadTasks() {
    this.api.tasks(this.processInstanceId).subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  complete(taskId: string) {
    this.api.completeTask(taskId).subscribe(() => this.loadTasks());
  }
}
