import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <section class="card" style="max-width: 520px; margin: 2rem auto">
      <h2 style="margin-top: 0">Login</h2>
      <p class="muted" style="margin-top: -0.25rem">Connexion requise</p>

      <div class="row" style="flex-direction: column; align-items: stretch">
        <label>
          Username
          <input [(ngModel)]="username" autocomplete="username" />
        </label>
        <label>
          Password
          <input [(ngModel)]="password" type="password" autocomplete="current-password" />
        </label>
      </div>

      <div class="actions" style="margin-top: 1rem">
        <button class="btn" (click)="login()" [disabled]="loading">Login</button>
      </div>

      <details style="margin-top: 1rem">
        <summary class="muted" style="cursor: pointer">Comptes démo</summary>
        <div class="muted" style="margin-top: 0.5rem">
          <div><code>admin / admin</code> (ADMIN)</div>
          <div><code>tech / tech</code> (TECH)</div>
          <div><code>operator / operator</code> (OPERATOR)</div>
        </div>
      </details>
    </section>
  `
})
export class LoginPageComponent {
  username = '';
  password = '';
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly i18n: I18nService
  ) {}

  login() {
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.detail || err?.error?.error || this.i18n.t('toast.failed');
        this.toast.push('error', msg);
      }
    });
  }
}
