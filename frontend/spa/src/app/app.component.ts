import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';
import { I18nService } from './i18n/i18n.service';
import { TranslatePipe } from './i18n/translate.pipe';
import { Locale, supportedLocales } from './i18n/translations';
import { FormsModule } from '@angular/forms';
import { ToastContainerComponent } from './ui/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'spa';

  readonly locales = supportedLocales;

  constructor(private readonly theme: ThemeService, private readonly i18n: I18nService) {
    this.theme.init();
    this.i18n.init();
  }

  get isDark(): boolean {
    return this.theme.current() === 'dark';
  }

  toggleTheme() {
    this.theme.toggle();
  }

  get locale(): Locale {
    return this.i18n.getLocale();
  }

  setLocale(locale: Locale) {
    this.i18n.setLocale(locale);
  }
}
