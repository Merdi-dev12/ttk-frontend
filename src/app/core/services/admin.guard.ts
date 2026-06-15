import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { ADMIN_ROUTES } from '../constants/admin-routes';

const verifyAdminSession = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restoreSession().pipe(
    map((authenticated) => authenticated ? true : router.parseUrl(ADMIN_ROUTES.login))
  );
};

export const adminGuard: CanActivateFn = verifyAdminSession;
export const adminMatchGuard: CanMatchFn = verifyAdminSession;

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.restoreSession().pipe(
    map((authenticated) => authenticated ? router.parseUrl(ADMIN_ROUTES.dashboard) : true)
  );
};
