import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeAutoConnectFactory } from './core/Initializer/auto-connect.initializer';
import { AuthenticationService } from './core/port/authentication.service';
import { UserService } from './core/port/user.service';
import { UserStore } from './core/store/user.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(() => {
      return initializeAutoConnectFactory(
        inject(AuthenticationService),
        inject(UserService),
        inject(UserStore),
      )();
    }),
  ],
};
