import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts" *ngIf="toastService.toasts().length">
      <div
        class="toast"
        *ngFor="let t of toastService.toasts()"
        [class.toast--success]="t.kind === 'success'"
        [class.toast--error]="t.kind === 'error'"
        [class.toast--info]="t.kind === 'info'"
      >
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toasts {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        display: grid;
        gap: 0.5rem;
        z-index: 50;
      }

      .toast {
        max-width: 360px;
        padding: 0.65rem 0.8rem;
        border-radius: 12px;
        border: 1px solid rgba(2, 6, 23, 0.12);
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 40px rgba(2, 6, 23, 0.16);
        font-weight: 700;
      }

      :host-context(html[data-theme='dark']) .toast {
        border-color: rgba(226, 232, 240, 0.16);
        background: rgba(15, 23, 42, 0.92);
      }

      .toast--success {
        border-color: rgba(22, 163, 74, 0.28);
      }

      .toast--error {
        border-color: rgba(220, 38, 38, 0.32);
      }
    `
  ]
})
export class ToastContainerComponent {
  constructor(readonly toastService: ToastService) {}
}

