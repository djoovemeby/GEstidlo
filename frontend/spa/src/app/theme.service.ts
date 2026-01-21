import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'gestidlo.theme';

  init() {
    const saved = (localStorage.getItem(this.storageKey) as Theme | null) ?? 'light';
    this.apply(saved);
  }

  toggle() {
    const next: Theme = this.current() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  current(): Theme {
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    return current ?? 'light';
  }

  private apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}

