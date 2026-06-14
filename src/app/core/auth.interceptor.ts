import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAuthRequest = request.url.includes('/auth/login') ||
    request.url.includes('/auth/refresh') ||
    request.url.includes('/auth/logout');

  const authenticatedRequest = auth.accessToken && !isAuthRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRequest || !auth.refreshToken) {
        return throwError(() => error);
      }

      return auth.refreshSession().pipe(
        switchMap((accessToken) => next(request.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` }
        }))),
        catchError((refreshError) => {
          auth.clearSession();
          void router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
