import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

const ADMIN_BASE = 'gestion-interne-ttk-v2';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restoreSession().pipe(
    map((authenticated) => authenticated ? true : router.createUrlTree([`/${ADMIN_BASE}/login`]))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restoreSession().pipe(
    map((authenticated) => authenticated ? router.createUrlTree([`/${ADMIN_BASE}/dashboard`]) : true)
  );
};
