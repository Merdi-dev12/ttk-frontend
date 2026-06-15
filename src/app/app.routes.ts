import { Routes } from '@angular/router';
import { adminGuard, adminMatchGuard, guestGuard } from './core/services/admin.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'gestion-interne-ttk-v2',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard').then((module) => module.AdminDashboardComponent),
        canMatch: [adminMatchGuard],
        canActivate: [adminGuard]
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then((module) => module.LoginComponent),
        canActivate: [guestGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
