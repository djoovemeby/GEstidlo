import { Injectable } from '@angular/core';
import { Locale, supportedLocales, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'gestidlo.locale';

  init() {
    const saved = (localStorage.getItem(this.storageKey) as Locale | null) ?? this.detectLocale();
    this.setLocale(saved);
  }

  getLocale(): Locale {
    const current = document.documentElement.getAttribute('data-locale') as Locale | null;
    return current ?? 'fr';
  }

  setLocale(locale: Locale) {
    document.documentElement.setAttribute('data-locale', locale);
    document.documentElement.lang = locale;
    localStorage.setItem(this.storageKey, locale);
  }

  toggleNext() {
    const locales = supportedLocales.map((l) => l.locale);
    const current = this.getLocale();
    const idx = locales.indexOf(current);
    const next = locales[(idx + 1) % locales.length];
    this.setLocale(next);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const locale = this.getLocale();
    const dict = translations[locale] ?? translations.fr;
    const fallback = translations.fr[key];
    const raw = dict[key] ?? fallback ?? key;

    if (!params) {
      return raw;
    }

    return Object.entries(params).reduce((acc, [k, v]) => {
      return acc.replaceAll(`{${k}}`, String(v));
    }, raw);
  }

  private detectLocale(): Locale {
    const nav = (navigator.language || 'fr').toLowerCase();
    if (nav.startsWith('en')) return 'en';
    if (nav.startsWith('ht')) return 'ht';
    return 'fr';
  }
}

