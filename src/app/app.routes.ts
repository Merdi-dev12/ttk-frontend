import { Routes } from '@angular/router';
import { adminGuard, adminMatchGuard, guestGuard } from './core/services/admin.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/client/layout/layout').then((m) => m.ClientLayout),
    children: [
      { path: '', loadComponent: () => import('./features/client/pages/home/home').then((m) => m.ClientHome) },
      { path: 'services', loadComponent: () => import('./features/client/pages/services/services').then((m) => m.ClientServices) },
      { path: 'services/:slug', loadComponent: () => import('./features/client/pages/service-detail/service-detail').then((m) => m.ClientServiceDetail) },
      { path: 'products/:slug', loadComponent: () => import('./features/client/pages/product-detail/product-detail').then((m) => m.ClientProductDetail) },
      { path: 'login', loadComponent: () => import('./features/client/pages/login/login').then((m) => m.ClientLogin) },
      { path: 'register', loadComponent: () => import('./features/client/pages/register/register').then((m) => m.ClientRegister) },
      { path: 'otp', loadComponent: () => import('./features/client/pages/otp/otp').then((m) => m.ClientOtp) },
    ],
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
