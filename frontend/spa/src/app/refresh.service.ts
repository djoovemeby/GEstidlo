import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type RefreshReason = 'manual' | 'auto';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private readonly subject = new Subject<{ reason: RefreshReason }>();
  readonly refresh$ = this.subject.asObservable();

  trigger(reason: RefreshReason = 'manual') {
    this.subject.next({ reason });
  }
}
