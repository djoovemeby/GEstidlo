import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type AuthUser = {
  username: string;
  roles: string[];
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'gestidlo.token';
  private readonly userKey = 'gestidlo.user';
  private readonly baseUrl = 'http://localhost:9083/api/auth';

  private readonly token$ = new BehaviorSubject<string | null>(null);
  private readonly user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private readonly http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
    const rawUser = localStorage.getItem(this.userKey);

    const normalizedToken = token && token !== 'null' && token !== 'undefined' && token.trim() !== '' ? token : null;
    if (!normalizedToken) {
      localStorage.removeItem(this.tokenKey);
    }
    this.token$.next(normalizedToken);

    if (rawUser) {
      try {
        this.user$.next(JSON.parse(rawUser) as AuthUser);
      } catch {
        this.user$.next(null);
      }
    }
  }

  tokenSnapshot(): string | null {
    return this.token$.value;
  }

  userSnapshot(): AuthUser | null {
    return this.user$.value;
  }

  userStream(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.token$.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((res) => {
        const token = String(res.token ?? '');
        if (!token) {
          throw new Error('Missing token');
        }
        const user: AuthUser = {
          username: String(res.username ?? username),
          roles: Array.isArray(res.roles) ? (res.roles as string[]) : []
        };
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.token$.next(token);
        this.user$.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token$.next(null);
    this.user$.next(null);
  }

  hasRole(role: string): boolean {
    const user = this.user$.value;
    return !!user?.roles?.includes(role);
  }
}
