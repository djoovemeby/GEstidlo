import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ProfileService } from '../profile.service';
import { RefreshService } from '../refresh.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../ui/toast.service';
import { I18nService } from '../i18n/i18n.service';

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
        <label>
          {{ 'processes.assignee' | t }}
          <input [(ngModel)]="assignee" />
        </label>
      </div>

      <div class="process-grid" *ngIf="definitions?.length">
        <div class="process-card" *ngFor="let d of definitions">
          <div style="display: flex; align-items: start; justify-content: space-between; gap: 0.75rem">
            <div>
              <div style="font-weight: 1000">{{ d.name || d.key }}</div>
              <div class="muted" style="margin-top: 0.15rem">
                <code>{{ d.key }}</code>
                <span *ngIf="d.version"> • v{{ d.version }}</span>
              </div>
            </div>
            <span class="badge badge--ok">READY</span>
          </div>

          <div class="actions" style="margin-top: 0.75rem">
            <button class="btn" (click)="start(d.key)">{{ 'processes.start' | t }}</button>
          </div>
        </div>
      </div>

      <p *ngIf="definitions && definitions.length === 0" class="muted">{{ 'processes.none' | t }}</p>
    </section>

    <section class="card">
      <h3 style="margin-top: 0">{{ 'processes.tasksTitle' | t }}</h3>

      <div class="row">
        <label>
          {{ 'processes.instance' | t }}
          <input [(ngModel)]="processInstanceId" placeholder="ex: 6109d9a2-f5b0-11f0-a5a1-..." />
        </label>
        <button class="btn btn--secondary" (click)="loadTasks()" [disabled]="!processInstanceId">
          {{ 'processes.loadTasks' | t }}
        </button>
      </div>

      <div class="task-grid" *ngIf="tasks?.length">
        <div class="task-card" *ngFor="let t of tasks">
          <div style="display: flex; align-items: start; justify-content: space-between; gap: 0.75rem">
            <div>
              <div style="font-weight: 1000">{{ t.name || 'Task' }}</div>
              <div class="muted" style="margin-top: 0.15rem"><code>{{ shortId(t.id) }}</code></div>
            </div>
            <span class="badge" [class.badge--warn]="!t.assignee" [class.badge--ok]="!!t.assignee">
              {{ t.assignee || 'UNASSIGNED' }}
            </span>
          </div>

          <div class="muted" style="margin-top: 0.5rem">{{ t.created || '-' }}</div>

          <div class="actions" style="margin-top: 0.75rem">
            <button class="btn" (click)="complete(t.id)">{{ 'processes.complete' | t }}</button>
          </div>
        </div>
      </div>

      <p *ngIf="tasks && tasks.length === 0" class="muted">Aucune tâche active pour cette instance.</p>
    </section>

    <details class="card" *ngIf="lastStart" style="overflow: hidden">
      <summary class="muted" style="cursor: pointer; font-weight: 900">{{ 'processes.lastStart' | t }}</summary>
      <pre style="margin-top: 0.75rem">{{ lastStart | json }}</pre>
    </details>
  `
})
export class ProcessesPageComponent implements OnDestroy {
  definitions: ProcessDefinition[] = [];
  tasks: CamundaTask[] = [];
  assignee = 'tech';

  private refreshSubscription?: Subscription;

  processInstanceId = '';
  lastStart: any;

  constructor(
    private readonly api: BffApiService,
    private readonly profile: ProfileService,
    private readonly refresh: RefreshService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.assignee = this.profile.getTechnicianName() || this.assignee;
    this.reload();

    this.refreshSubscription = this.refresh.refresh$.subscribe((e) => {
      const showErrorToast = e.reason === 'manual';
      this.reload(showErrorToast);
      if (this.processInstanceId) {
        this.loadTasks(showErrorToast);
      }
    });
  }

  reload(showErrorToast = false) {
    this.api.processDefinitions().subscribe({
      next: (defs) => {
        this.definitions = defs;
      },
      error: () => {
        if (showErrorToast) {
          this.toast.push('error', this.i18n.t('toast.failed'));
        }
        this.definitions = [];
      }
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

  loadTasks(showErrorToast = false) {
    this.api.tasks(this.processInstanceId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: () => {
        if (showErrorToast) {
          this.toast.push('error', this.i18n.t('toast.failed'));
        }
        this.tasks = [];
      }
    });
  }

  complete(taskId: string) {
    this.api.completeTask(taskId).subscribe(() => this.loadTasks());
  }

  shortId(id: string): string {
    if (!id) return '-';
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}…${id.slice(-4)}`;
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
}
