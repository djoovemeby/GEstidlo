import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BffApiService } from '../api/bff-api.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PointsService } from '../points.service';
import type { PointDefinition, PointType } from '../points.service';
import { ToastService } from '../ui/toast.service';

type ThresholdRow = { type: string; minWarn?: number | null; minCrit?: number | null };
type CodeListRow = {
  listName: string;
  code: string;
  labelFr?: string | null;
  labelHt?: string | null;
  labelEn?: string | null;
  color?: string | null;
  sortOrder?: number | null;
  active: boolean;
};

@Component({
  selector: 'app-reference-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2>{{ 'reference.title' | t }}</h2>

    <nav class="ref-nav">
      <button class="ref-tab" type="button" (click)="section = 'points'" [class.active]="section === 'points'">
        {{ 'reference.points.title' | t }}
      </button>
      <button
        class="ref-tab"
        type="button"
        (click)="section = 'thresholds'"
        [class.active]="section === 'thresholds'"
      >
        {{ 'reference.thresholds.title' | t }}
      </button>
      <button class="ref-tab" type="button" (click)="section = 'codelists'" [class.active]="section === 'codelists'">
        {{ 'reference.codelists.title' | t }}
      </button>

      <div style="margin-left: auto">
        <button class="btn btn--secondary" (click)="reload()">{{ 'common.refresh' | t }}</button>
      </div>
    </nav>

    <section class="ref-content">
      <section class="card" *ngIf="section === 'points'">
          <h3 style="margin-top: 0">{{ 'reference.points.title' | t }}</h3>

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
                <tr *ngFor="let p of points">
                  <td><code>{{ p.id }}</code></td>
                  <td><input [(ngModel)]="p.name" /></td>
                  <td>
                    <select [(ngModel)]="p.type">
                      <option *ngFor="let t of pointTypes" [ngValue]="t">{{ t }}</option>
                    </select>
                  </td>
                  <td><input [(ngModel)]="p.description" /></td>
                  <td>
                    <input type="checkbox" [(ngModel)]="p.active" />
                  </td>
                  <td class="actions-cell">
                    <div class="actions actions--table">
                      <button class="btn" (click)="savePoint(p)">{{ 'common.save' | t }}</button>
                      <button class="btn btn--secondary" (click)="deletePoint(p.id)">{{ 'common.delete' | t }}</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><input [(ngModel)]="newPoint.id" placeholder="POINT-004" /></td>
                  <td><input [(ngModel)]="newPoint.name" placeholder="KIOSK-02" /></td>
                  <td>
                    <select [(ngModel)]="newPoint.type">
                      <option *ngFor="let t of pointTypes" [ngValue]="t">{{ t }}</option>
                    </select>
                  </td>
                  <td><input [(ngModel)]="newPoint.description" placeholder="..." /></td>
                  <td><input type="checkbox" [(ngModel)]="newPoint.active" /></td>
                  <td class="actions-cell">
                    <div class="actions actions--table">
                      <button class="btn" (click)="addPoint()" [disabled]="!newPoint.id">{{ 'common.add' | t }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      <section class="card" *ngIf="section === 'thresholds'">
          <h3 style="margin-top: 0">{{ 'reference.thresholds.title' | t }}</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>{{ 'table.type' | t }}</th>
                  <th>{{ 'reference.thresholds.minWarn' | t }}</th>
                  <th>{{ 'reference.thresholds.minCrit' | t }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of thresholds">
                  <td><code>{{ row.type }}</code></td>
                  <td><input type="number" [(ngModel)]="row.minWarn" /></td>
                  <td><input type="number" [(ngModel)]="row.minCrit" /></td>
                  <td class="actions-cell">
                    <div class="actions actions--table">
                      <button class="btn" (click)="saveThreshold(row)">{{ 'common.save' | t }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      <section class="card" *ngIf="section === 'codelists'">
          <h3 style="margin-top: 0">{{ 'reference.codelists.title' | t }}</h3>

          <div class="row">
            <label>
              {{ 'reference.codelists.list' | t }}
              <select [(ngModel)]="selectedList" (ngModelChange)="loadCodeList()">
                <option *ngFor="let l of codeLists" [ngValue]="l.name">{{ listLabel(l.name) }}</option>
              </select>
            </label>
          </div>

          <div class="table-wrap" *ngIf="selectedList">
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
                <tr *ngFor="let row of codeItems">
                  <td><code>{{ row.code }}</code></td>
                  <td><input [(ngModel)]="row.labelFr" /></td>
                  <td><input [(ngModel)]="row.labelHt" /></td>
                  <td><input [(ngModel)]="row.labelEn" /></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                      <input [(ngModel)]="row.color" placeholder="#2563eb" style="min-width: 120px" />
                      <span
                        class="badge"
                        [style.borderColor]="row.color || ''"
                        [style.background]="row.color ? row.color + '22' : ''"
                        [style.color]="row.color || ''"
                      >
                        {{ row.color || '-' }}
                      </span>
                    </div>
                  </td>
                  <td><input type="number" [(ngModel)]="row.sortOrder" style="min-width: 90px" /></td>
                  <td><input type="checkbox" [(ngModel)]="row.active" /></td>
                  <td class="actions-cell">
                    <div class="actions actions--table">
                      <button class="btn" (click)="saveCodeItem(row)">{{ 'common.save' | t }}</button>
                      <button class="btn btn--secondary" (click)="deleteCodeItem(row)">{{ 'common.delete' | t }}</button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td><input [(ngModel)]="newCode.code" placeholder="NEW_CODE" /></td>
                  <td><input [(ngModel)]="newCode.labelFr" placeholder="..." /></td>
                  <td><input [(ngModel)]="newCode.labelHt" placeholder="..." /></td>
                  <td><input [(ngModel)]="newCode.labelEn" placeholder="..." /></td>
                  <td><input [(ngModel)]="newCode.color" placeholder="#2563eb" style="min-width: 120px" /></td>
                  <td><input type="number" [(ngModel)]="newCode.sortOrder" style="min-width: 90px" /></td>
                  <td><input type="checkbox" [(ngModel)]="newCode.active" /></td>
                  <td class="actions-cell">
                    <div class="actions actions--table">
                      <button class="btn" (click)="addCodeItem()" [disabled]="!selectedList || !newCode.code">
                        {{ 'common.add' | t }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </section>
    </section>
  `
})
export class ReferencePageComponent {
  section: 'points' | 'thresholds' | 'codelists' = 'points';
  points: PointDefinition[] = [];
  thresholds: ThresholdRow[] = [];

  codeLists: Array<{ name: string }> = [];
  selectedList = '';
  codeItems: CodeListRow[] = [];
  newCode = {
    code: '',
    labelFr: '',
    labelHt: '',
    labelEn: '',
    color: '#2563eb',
    sortOrder: 10,
    active: true
  };

  pointTypes: PointType[] = ['KIOSK', 'SCHOOL', 'TANK', 'SOURCE'];

  newPoint: PointDefinition = {
    id: '',
    name: '',
    type: 'KIOSK',
    description: '',
    active: true
  };

  constructor(
    private readonly api: BffApiService,
    private readonly pointsService: PointsService,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {
    this.reload();
  }

  reload() {
    this.api.referencePoints().subscribe((points) => {
      this.points = [...points].sort((a, b) => a.id.localeCompare(b.id));
    });
    this.api.referenceThresholds().subscribe((rows) => {
      this.thresholds = [...rows].sort((a, b) => a.type.localeCompare(b.type));
    });

    this.api.referenceCodeLists().subscribe((lists) => {
      this.codeLists = [...lists].sort((a, b) => a.name.localeCompare(b.name));
      if (!this.selectedList && this.codeLists.length > 0) {
        this.selectedList = this.codeLists[0].name;
        this.loadCodeList();
      }
    });
  }

  listLabel(name: string): string {
    const key = `codelist.${name}`;
    const translated = this.i18n.t(key);
    return translated === key ? name : translated;
  }

  loadCodeList() {
    if (!this.selectedList) {
      this.codeItems = [];
      return;
    }
    this.api.referenceCodeList(this.selectedList).subscribe((items) => {
      this.codeItems = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.code.localeCompare(b.code));
    });
  }

  addPoint() {
    const id = (this.newPoint.id ?? '').trim();
    if (!id) {
      return;
    }

    const payload = {
      name: this.newPoint.name,
      type: this.newPoint.type,
      description: this.newPoint.description,
      active: this.newPoint.active
    };
    this.api.upsertReferencePoint(id, payload).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.newPoint = { id: '', name: '', type: 'KIOSK', description: '', active: true };
        this.pointsService.refresh();
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  savePoint(p: PointDefinition) {
    this.api.upsertReferencePoint(p.id, {
      name: p.name,
      type: p.type,
      description: p.description,
      active: p.active !== false
    }).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.pointsService.refresh();
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  deletePoint(id: string) {
    if (!window.confirm(`${this.i18n.t('common.delete')} ${id} ?`)) {
      return;
    }
    this.api.deleteReferencePoint(id).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.pointsService.refresh();
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  saveThreshold(row: ThresholdRow) {
    this.api.upsertThreshold(row.type, { minWarn: row.minWarn ?? null, minCrit: row.minCrit ?? null }).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.reload();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  addCodeItem() {
    const listName = this.selectedList;
    const code = (this.newCode.code ?? '').trim();
    if (!listName || !code) {
      return;
    }
    this.api.upsertCodeItem(listName, code, {
      labelFr: this.newCode.labelFr,
      labelHt: this.newCode.labelHt,
      labelEn: this.newCode.labelEn,
      color: this.newCode.color,
      sortOrder: this.newCode.sortOrder,
      active: this.newCode.active
    }).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.newCode = { code: '', labelFr: '', labelHt: '', labelEn: '', color: '#2563eb', sortOrder: 10, active: true };
        this.loadCodeList();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  saveCodeItem(row: CodeListRow) {
    this.api.upsertCodeItem(row.listName, row.code, {
      labelFr: row.labelFr ?? null,
      labelHt: row.labelHt ?? null,
      labelEn: row.labelEn ?? null,
      color: row.color ?? null,
      sortOrder: row.sortOrder ?? 0,
      active: row.active
    }).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.loadCodeList();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }

  deleteCodeItem(row: CodeListRow) {
    if (!window.confirm(`${this.i18n.t('common.delete')} ${row.code} ?`)) {
      return;
    }
    this.api.deleteCodeItem(row.listName, row.code).subscribe({
      next: () => {
        this.toast.push('success', this.i18n.t('common.saved'));
        this.loadCodeList();
      },
      error: () => this.toast.push('error', this.i18n.t('toast.failed'))
    });
  }
}
