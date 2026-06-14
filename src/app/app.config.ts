import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';

import { routes } from './app.routes';
import { ADMIN_ICONS } from './admin/admin-dashboard';
import { authInterceptor } from './core/auth.interceptor';

/**
 * Application Configuration
 * Centralized providers for the entire application
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick(ADMIN_ICONS))
  ]
};
