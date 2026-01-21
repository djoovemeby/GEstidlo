import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { BffApiService } from '../api/bff-api.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PointTypesService } from '../point-types.service';
import { PointDefinition, PointsService } from '../points.service';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-points-config-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'reference.points.title' | t }}</h2>

    <section class="card">
      <h3 style="margin-top: 0">{{ 'common.add' | t }}</h3>
      <div class="row">
        <label>
          {{ 'table.id' | t }}
          <input [(ngModel)]="draft.id" placeholder="POINT-004" />
        </label>
        <label>
          {{ 'table.point' | t }}
          <input [(ngModel)]="draft.name" placeholder="KIOSK-04" />
        </label>
        <label>
          {{ 'table.type' | t }}
          <select [(ngModel)]="draft.type">
            <option *ngFor="let t of pointTypeCodes" [value]="t">{{ pointTypeLabel(t) }}</option>
          </select>
        </label>
        <label>
          {{ 'table.description' | t }}
          <input [(ngModel)]="draft.description" />
        </label>
        <label>
          {{ 'table.active' | t }}
          <input type="checkbox" [(ngModel)]="draft.active" />
        </label>
      </div>
      <div class="actions">
        <button class="btn" (click)="create()">{{ 'common.add' | t }}</button>
      </div>
    </section>

    <section class="card">
      <h3 style="margin-top: 0">{{ 'common.view' | t }}</h3>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ 'table.id' | t }}</th>
              <th>{{ 'table.point' | t }}</th>
              <th>{{ 'table.type' | t }}</th>
              <th>{{ 'table.description' | t }}</th>
              <th>{{ 'table.active' | t }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of items">
              <td style="font-weight: 900"><code>{{ p.id }}</code></td>
              <td><input [(ngModel)]="p.name" /></td>
              <td>
                <select [(ngModel)]="p.type">
                  <option *ngFor="let t of pointTypeCodes" [value]="t">{{ pointTypeLabel(t) }}</option>
                </select>
              </td>
              <td><input [(ngModel)]="p.description" /></td>
              <td style="text-align: center"><input type="checkbox" [(ngModel)]="p.active" /></td>
              <td class="actions-cell">
                <div class="actions actions--table">
                  <button class="btn btn--secondary" (click)="save(p)">{{ 'common.save' | t }}</button>
                  <button class="btn btn--danger" (click)="remove(p)">{{ 'common.delete' | t }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class PointsConfigPageComponent implements OnDestroy {
  items: PointDefinition[] = [];
  pointTypeCodes: string[] = ['KIOSK', 'SCHOOL', 'TANK', 'SOURCE'];

  draft: Partial<PointDefinition> = {
    id: '',
    name: '',
    type: 'KIOSK',
    description: '',
    active: true
  };

  private pointsSub?: Subscription;
  private typesSub?: Subscription;

  constructor(
    private readonly api: BffApiService,
    private readonly points: PointsService,
    private readonly pointTypes: PointTypesService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.pointsSub = this.points.stream().subscribe((rows) => {
      this.items = (rows ?? []).map((p) => ({ ...p }));
    });

    this.pointTypes.ensureLoaded().subscribe();
    this.typesSub = this.pointTypes.stream().subscribe((types) => {
      const codes = (types ?? []).filter((t) => t.active).map((t) => t.code);
      if (codes.length) {
        this.pointTypeCodes = codes;
        if (!this.pointTypeCodes.includes(String(this.draft.type))) {
          this.draft.type = this.pointTypeCodes[0];
        }
      }
    });

    this.points.reload().subscribe();
  }

  private showError(err: any) {
    const msg = err?.error?.message || err?.error?.error || this.i18n.t('toast.failed');
    this.toast.push('error', msg);
  }

  pointTypeLabel(code: string): string {
    return this.pointTypes.label(code);
  }

  create() {
    const id = (this.draft.id ?? '').trim();
    if (!id) {
      this.toast.push('error', `${this.i18n.t('table.id')} ${this.i18n.t('common.required')}`);
      return;
    }

    this.api
      .upsertReferencePoint(id, {
        name: this.draft.name ?? null,
        type: String(this.draft.type ?? '').trim().toUpperCase() || null,
        description: this.draft.description ?? null,
        active: this.draft.active ?? true
      })
      .subscribe({
        next: () => {
          this.toast.push('success', this.i18n.t('common.saved'));
          this.draft = { id: '', name: '', type: this.pointTypeCodes[0] ?? 'KIOSK', description: '', active: true };
          this.points.reload().subscribe();
        },
        error: (err) => this.showError(err)
      });
  }

  save(p: PointDefinition) {
    this.api
      .upsertReferencePoint(p.id, {
        name: p.name ?? null,
        type: (p.type ?? '').trim().toUpperCase() || null,
        description: p.description ?? null,
        active: p.active
      })
      .subscribe({
        next: () => {
          this.toast.push('success', this.i18n.t('common.saved'));
          this.points.reload().subscribe();
        },
        error: (err) => this.showError(err)
      });
  }

  remove(p: PointDefinition) {
    this.api.deleteReferencePoint(p.id).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.points.reload().subscribe();
      },
      error: (err) => this.showError(err)
    });
  }

  ngOnDestroy(): void {
    this.pointsSub?.unsubscribe();
    this.typesSub?.unsubscribe();
  }
}

