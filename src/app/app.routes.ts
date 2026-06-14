import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard';
import { LoginComponent } from './auth/login';
import { adminGuard } from './core/admin.guard';

/**
 * Application Routes Configuration
 */
export const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
