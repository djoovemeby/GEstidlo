import { Injectable, signal } from '@angular/core';

export type Toast = {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  push(kind: Toast['kind'], message: string, ttlMs = 2500) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.toasts.update((list) => [...list, { id, kind, message }]);

    window.setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
    }, ttlMs);
  }
}

