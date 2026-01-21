import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { BffApiService } from '../api/bff-api.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { CodeItemDto, MeasurementTypesService } from '../measurement-types.service';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-measurement-types-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'codelist.MEASUREMENT_TYPE' | t }}</h2>

    <section class="card">
      <h3 style="margin-top: 0">{{ 'common.add' | t }}</h3>
      <div class="row">
        <label>
          {{ 'table.code' | t }}
          <input [(ngModel)]="draft.code" placeholder="VOLUME" />
        </label>
        <label>
          {{ 'table.labelFr' | t }}
          <input [(ngModel)]="draft.labelFr" />
        </label>
        <label>
          {{ 'table.labelHt' | t }}
          <input [(ngModel)]="draft.labelHt" />
        </label>
        <label>
          {{ 'table.labelEn' | t }}
          <input [(ngModel)]="draft.labelEn" />
        </label>
        <label>
          {{ 'table.color' | t }}
          <input [(ngModel)]="draft.color" placeholder="#2563eb" />
        </label>
        <label>
          {{ 'table.order' | t }}
          <input type="number" [(ngModel)]="draft.sortOrder" />
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
      <h3 style="margin-top: 0">{{ 'reference.codelists.title' | t }}</h3>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ 'table.code' | t }}</th>
              <th>{{ 'table.labelFr' | t }}</th>
              <th>{{ 'table.labelHt' | t }}</th>
              <th>{{ 'table.labelEn' | t }}</th>
              <th>{{ 'table.color' | t }}</th>
              <th>{{ 'table.order' | t }}</th>
              <th>{{ 'table.active' | t }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of items">
              <td style="font-weight: 900"><code>{{ t.code }}</code></td>
              <td><input [(ngModel)]="t.labelFr" /></td>
              <td><input [(ngModel)]="t.labelHt" /></td>
              <td><input [(ngModel)]="t.labelEn" /></td>
              <td><input [(ngModel)]="t.color" placeholder="#2563eb" /></td>
              <td style="max-width: 6rem"><input type="number" [(ngModel)]="t.sortOrder" /></td>
              <td style="text-align: center"><input type="checkbox" [(ngModel)]="t.active" /></td>
              <td class="actions-cell">
                <div class="actions actions--table">
                  <button class="btn btn--secondary" (click)="save(t)">{{ 'common.save' | t }}</button>
                  <button class="btn btn--danger" (click)="remove(t)">{{ 'common.delete' | t }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class MeasurementTypesPageComponent implements OnDestroy {
  items: CodeItemDto[] = [];
  draft: Partial<CodeItemDto> = {
    code: '',
    labelFr: '',
    labelHt: '',
    labelEn: '',
    color: '#2563eb',
    sortOrder: 50,
    active: true
  };

  private sub?: Subscription;

  constructor(
    private readonly api: BffApiService,
    private readonly measurementTypes: MeasurementTypesService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.sub = this.measurementTypes.stream().subscribe((items) => {
      this.items = (items ?? []).map((i) => ({ ...i }));
    });
    this.measurementTypes.reload().subscribe();
  }

  private showError(err: any) {
    const msg = err?.error?.message || err?.error?.error || this.i18n.t('toast.failed');
    this.toast.push('error', msg);
  }

  create() {
    const code = (this.draft.code ?? '').trim().toUpperCase();
    if (!code) {
      this.toast.push('error', `${this.i18n.t('table.code')} ${this.i18n.t('common.required')}`);
      return;
    }

    this.api
      .upsertCodeItem('MEASUREMENT_TYPE', code, {
        labelFr: this.draft.labelFr ?? null,
        labelHt: this.draft.labelHt ?? null,
        labelEn: this.draft.labelEn ?? null,
        color: this.draft.color ?? null,
        sortOrder: this.draft.sortOrder ?? null,
        active: this.draft.active ?? true
      })
      .subscribe({
        next: () => {
          this.toast.push('success', this.i18n.t('common.saved'));
          this.draft = { code: '', labelFr: '', labelHt: '', labelEn: '', color: '#2563eb', sortOrder: 50, active: true };
          this.measurementTypes.reload().subscribe();
        },
        error: (err) => this.showError(err)
      });
  }

  save(item: CodeItemDto) {
    this.api
      .upsertCodeItem('MEASUREMENT_TYPE', item.code, {
        labelFr: item.labelFr ?? null,
        labelHt: item.labelHt ?? null,
        labelEn: item.labelEn ?? null,
        color: item.color ?? null,
        sortOrder: item.sortOrder ?? null,
        active: item.active
      })
      .subscribe({
        next: () => {
          this.toast.push('success', this.i18n.t('common.saved'));
          this.measurementTypes.reload().subscribe();
        },
        error: (err) => this.showError(err)
      });
  }

  remove(item: CodeItemDto) {
    this.api.deleteCodeItem('MEASUREMENT_TYPE', item.code).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.measurementTypes.reload().subscribe();
      },
      error: (err) => this.showError(err)
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

