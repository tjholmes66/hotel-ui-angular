import { InjectionToken } from '@angular/core';
import { Portal } from './auth.models';

export interface AuthConfig {
  /**
   * Base URL of the BFF. Leave empty for same-origin requests (the dev proxy
   * forwards /api, /oauth2, /login and /logout to the BFF).
   */
  bffBaseUrl: string;
  /** Base URL used for full-page login and logout navigations. */
  authBaseUrl: string;
  /** Portal represented by the running Angular application. */
  portal: Portal;
  /** Absolute URLs of both portals, used for cross-portal redirects. */
  portals: Record<Portal, string>;
  /** Angular route that renders the login page. */
  loginPath: string;
}

export interface HotelRuntimeConfig {
  bffBaseUrl?: string;
  authBaseUrl?: string;
  guestPortalUrl?: string;
  staffPortalUrl?: string;
}

declare global {
  interface Window {
    __HOTEL_CONFIG__?: HotelRuntimeConfig;
  }
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');

export function createAuthConfig(portal: Portal): AuthConfig {
  const runtime = (typeof window !== 'undefined' ? window.__HOTEL_CONFIG__ : undefined) ?? {};
  const devAuthBaseUrl =
    typeof window !== 'undefined' && ['4200', '4201'].includes(window.location.port)
      ? `${window.location.protocol}//${window.location.hostname}:8080`
      : '';

  return {
    bffBaseUrl: runtime.bffBaseUrl ?? '',
    authBaseUrl: runtime.authBaseUrl ?? runtime.bffBaseUrl ?? devAuthBaseUrl,
    portal,
    portals: {
      guest: runtime.guestPortalUrl ?? 'http://localhost:4200',
      staff: runtime.staffPortalUrl ?? 'http://localhost:4201',
    },
    loginPath: '/login',
  };
}
