import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideLottieOptions } from 'ngx-lottie';

import { routes } from './app.routes';

/**
 * Application Configuration
 * Centralized providers for the entire application
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ]
};
