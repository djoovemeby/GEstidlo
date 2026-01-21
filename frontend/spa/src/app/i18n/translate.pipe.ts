import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 't',
  standalone: true,
  // impure => la vue se met à jour quand la langue change (sans signals/rx)
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}

