import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  styleUrl: './config-page.component.scss',
  template: `
    <h2>{{ 'nav.config' | t }}</h2>

    <section class="settings-layout">
      <aside class="settings-nav">
        <a routerLink="./measurement-types" routerLinkActive="active">{{ 'codelist.MEASUREMENT_TYPE' | t }}</a>
        <a routerLink="./point-types" routerLinkActive="active">{{ 'codelist.POINT_TYPE' | t }}</a>
        <a routerLink="./points" routerLinkActive="active">{{ 'reference.points.title' | t }}</a>
        <a routerLink="./thresholds" routerLinkActive="active">{{ 'reference.thresholds.title' | t }}</a>
      </aside>

      <section class="settings-content">
        <router-outlet />
      </section>
    </section>
  `
})
export class ConfigPageComponent {}
