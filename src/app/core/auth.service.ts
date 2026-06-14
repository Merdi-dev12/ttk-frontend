import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, ApiUser, LoginResponseData } from './api.models';

const REFRESH_TOKEN_KEY = 'ttk_admin_refresh_token';
const USER_KEY = 'ttk_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private accessTokenValue: string | null = null;
  private readonly userSubject = new BehaviorSubject<ApiUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  get user(): ApiUser | null {
    return this.userSubject.value;
  }

  get accessToken(): string | null {
    return this.accessTokenValue;
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<ApiUser> {
    return this.http.post<ApiResponse<LoginResponseData>>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      map((response) => response.data),
      switchMap((session) => {
        if (session.user.role !== 'ADMIN') {
          return throwError(() => new Error('Ce compte ne dispose pas des droits administrateur.'));
        }

        this.persistSession(session);
        return of(session.user);
      })
    );
  }

  loadProfile(): Observable<ApiUser> {
    return this.http.get<ApiResponse<{ user: ApiUser }>>(`${environment.apiUrl}/auth/me`).pipe(
      map((response) => response.data.user),
      tap((user) => this.persistUser(user))
    );
  }

  restoreSession(): Observable<boolean> {
    if (this.accessTokenValue) {
      return this.loadProfile().pipe(map(() => true), catchError(() => of(false)));
    }

    if (!this.refreshToken) {
      this.clearSession();
      return of(false);
    }

    return this.refreshSession().pipe(
      switchMap(() => this.loadProfile()),
      map((user) => user.role === 'ADMIN'),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  refreshSession(): Observable<string> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Session expirée.'));
    }

    return this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      map((response) => response.data),
      tap((tokens) => {
        this.accessTokenValue = tokens.accessToken;
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }),
      map((tokens) => tokens.accessToken)
    );
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
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private persistSession(session: LoginResponseData): void {
    this.accessTokenValue = session.accessToken;
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    this.persistUser(session.user);
  }

  private persistUser(user: ApiUser): void {
    this.userSubject.next(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private readStoredUser(): ApiUser | null {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as ApiUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
