import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { environment } from './environments/environment';
import { ApiResponse, ApiUser, LoginResponseData } from './models/api.models';

const REFRESH_TOKEN_KEY = 'ttk_admin_refresh_token';
const LAST_ACTIVITY_KEY = 'ttk_admin_last_activity';
const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private accessTokenValue: string | null = null;
  private refreshRequest$: Observable<string> | null = null;
  private readonly userSubject = new BehaviorSubject<ApiUser | null>(null);
  private lastActivityUpdate = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  readonly user$ = this.userSubject.asObservable();

  get user(): ApiUser | null {
    return this.userSubject.value;
  }

  get accessToken(): string | null {
    return this.accessTokenValue;
  }

  get refreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<ApiUser> {
    return this.http.post<ApiResponse<LoginResponseData>>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      map((response) => response.data),
      switchMap((session) => {
        this.assertActiveAdmin(session.user);

        this.persistSession(session);
        return of(session.user);
      })
    );
  }

  loadProfile(): Observable<ApiUser> {
    return this.http.get<ApiResponse<{ user: ApiUser }>>(`${environment.apiUrl}/auth/me`).pipe(
      map((response) => response.data.user),
      tap((user) => {
        this.assertActiveAdmin(user);
        this.userSubject.next(user);
      })
    );
  }

  restoreSession(): Observable<boolean> {
    if (this.isSessionIdle()) {
      this.clearSession();
      return of(false);
    }

    if (this.accessTokenValue) {
      return this.loadProfile().pipe(
        tap(() => this.registerActivity(true)),
        map(() => true),
        catchError(() => {
          this.clearSession();
          return of(false);
        })
      );
    }

    if (!this.refreshToken) {
      this.clearSession();
      return of(false);
    }

    return this.refreshSession().pipe(
      switchMap(() => this.loadProfile()),
      tap(() => this.registerActivity(true)),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  refreshSession(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Session expirée.'));
    }

    this.refreshRequest$ = this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      map((response) => response.data),
      tap((tokens) => {
        this.accessTokenValue = tokens.accessToken;
        sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }),
      map((tokens) => tokens.accessToken),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshRequest$;
  }

  logout(): Observable<void> {
    const refreshToken = this.refreshToken;
    const request$ = refreshToken
      ? this.http.post<void>(`${environment.apiUrl}/auth/logout`, { refreshToken })
      : of(undefined);

    return request$.pipe(
      catchError(() => of(undefined)),
      tap(() => {
        this.clearSession();
        void this.router.navigate(['/login']);
      }),
      map(() => undefined)
    );
  }

  clearSession(): void {
    this.accessTokenValue = null;
    this.userSubject.next(null);
    this.refreshRequest$ = null;
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('ttk_admin_user');
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  registerActivity(force = false): void {
    if (!this.refreshToken) return;
    if (this.isSessionIdle()) {
      this.clearSession();
      void this.router.navigate(['/login']);
      return;
    }
    const now = Date.now();
    if (!force && now - this.lastActivityUpdate < 30_000) return;
    this.lastActivityUpdate = now;
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    this.scheduleIdleLogout();
  }

  private persistSession(session: LoginResponseData): void {
    this.accessTokenValue = session.accessToken;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    this.userSubject.next(session.user);
    this.registerActivity(true);
  }

  private isSessionIdle(): boolean {
    const lastActivity = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY));
    return Boolean(lastActivity && Date.now() - lastActivity > SESSION_IDLE_TIMEOUT);
  }

  private scheduleIdleLogout(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.logout().subscribe();
    }, SESSION_IDLE_TIMEOUT);
  }

  private assertActiveAdmin(user: ApiUser): void {
    if (user.role !== 'ADMIN') {
      this.clearSession();
      throw new Error('Ce compte ne dispose pas des droits administrateur.');
    }
    if (user.status !== 'ACTIVE') {
      this.clearSession();
      throw new Error('Ce compte administrateur est révoqué.');
    }
  }
}
