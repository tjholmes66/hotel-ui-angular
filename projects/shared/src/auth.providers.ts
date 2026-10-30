import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { AUTH_CONFIG, AuthConfig } from './auth.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

/**
 * Wires up the BFF integration:
 * - every request uses withCredentials and the browser's session cookie
 * - Angular sends the XSRF-TOKEN cookie as X-XSRF-TOKEN for mutations
 * - GET /api/v1/me is loaded during application startup
 */
export function provideHotelAuth(config: AuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CONFIG, useValue: config },
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
    provideAppInitializer(() => inject(AuthService).loadCurrentUser()),
  ]);
}
