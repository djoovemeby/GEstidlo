import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { BffApiService } from './api/bff-api.service';
import { I18nService } from './i18n/i18n.service';

export type CodeItemDto = {
  listName: string;
  code: string;
  labelFr?: string | null;
  labelHt?: string | null;
  labelEn?: string | null;
  color?: string | null;
  sortOrder?: number | null;
  active: boolean;
};

@Injectable({ providedIn: 'root' })
export class MeasurementTypesService {
  private readonly listName = 'MEASUREMENT_TYPE';
  private readonly items$ = new BehaviorSubject<CodeItemDto[]>([]);
  private loaded = false;
  private inFlight?: Observable<CodeItemDto[]>;

  constructor(private readonly api: BffApiService, private readonly i18n: I18nService) {}

  stream(): Observable<CodeItemDto[]> {
    return this.items$.asObservable();
  }

  snapshot(): CodeItemDto[] {
    return this.items$.value;
  }

  active(): CodeItemDto[] {
    return this.items$.value.filter((t) => t.active);
  }

  ensureLoaded(): Observable<CodeItemDto[]> {
    if (this.loaded) {
      return this.items$.asObservable();
    }
    if (!this.inFlight) {
      this.inFlight = this.reload();
    }
    return this.inFlight;
  }

  reload(): Observable<CodeItemDto[]> {
    return this.api.referenceCodeList(this.listName).pipe(
      tap((rows) => {
        this.loaded = true;
        this.inFlight = undefined;
        this.items$.next(rows as CodeItemDto[]);
      })
    );
  }

  label(code?: string | null): string {
    if (!code) {
      return '-';
    }

    const found = this.items$.value.find((t) => t.code === code);
    if (found) {
      const locale = this.i18n.getLocale();
      if (locale === 'ht') return found.labelHt || found.labelFr || found.labelEn || found.code;
      if (locale === 'en') return found.labelEn || found.labelFr || found.labelHt || found.code;
      return found.labelFr || found.labelEn || found.labelHt || found.code;
    }

    const key = `measurement.${code}`;
    const translated = this.i18n.t(key);
    return translated === key ? code : translated;
  }
}

