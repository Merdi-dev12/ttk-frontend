import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin/admin-dashboard';
import { LoginComponent } from './features/auth/login';
import { adminGuard, guestGuard } from './core/services/admin.guard';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'gestion-interne-ttk-v2',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
