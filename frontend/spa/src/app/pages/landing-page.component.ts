import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <h1>{{ 'landing.title' | t }}</h1>
        <p class="muted">{{ 'landing.subtitle' | t }}</p>

        <div class="actions" style="margin-top: 1rem">
          <a class="btn" routerLink="/login">{{ 'landing.cta.login' | t }}</a>
        </div>
      </div>
    </section>

    <section class="grid-2" style="margin-top: 1rem">
      <section class="card">
        <h3 style="margin-top: 0">{{ 'landing.feature.realtime.title' | t }}</h3>
        <div class="muted">{{ 'landing.feature.realtime.body' | t }}</div>
      </section>
      <section class="card">
        <h3 style="margin-top: 0">{{ 'landing.feature.alerts.title' | t }}</h3>
        <div class="muted">{{ 'landing.feature.alerts.body' | t }}</div>
      </section>
      <section class="card">
        <h3 style="margin-top: 0">{{ 'landing.feature.workflow.title' | t }}</h3>
        <div class="muted">{{ 'landing.feature.workflow.body' | t }}</div>
      </section>
      <section class="card">
        <h3 style="margin-top: 0">{{ 'landing.feature.config.title' | t }}</h3>
        <div class="muted">{{ 'landing.feature.config.body' | t }}</div>
      </section>
    </section>
  `,
  styles: [
    `
      .hero {
        border: 1px solid var(--border);
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(16, 185, 129, 0.08));
        border-radius: 18px;
        padding: 1.25rem;
      }

      .hero-inner {
        max-width: 880px;
      }

      h1 {
        margin: 0;
        font-size: 2rem;
        letter-spacing: -0.03em;
      }

      @media (max-width: 820px) {
        h1 {
          font-size: 1.6rem;
        }
      }
    `
  ]
})
export class LandingPageComponent {
}
