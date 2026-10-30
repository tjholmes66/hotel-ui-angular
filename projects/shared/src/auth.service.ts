import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import { Portal, resolvePortal, UserInfo } from './auth.models';

/**
 * Set this context token on requests that must not trigger the automatic
 * login redirect (for example the bootstrap GET /api/v1/me call).
 */
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  private readonly userState = signal<UserInfo | null>(null);
  private readonly loadedState = signal(false);
  private inFlight: Observable<UserInfo | null> | null = null;
  private redirecting = false;

  readonly user = this.userState.asReadonly();
  readonly loaded = this.loadedState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly portal = computed(() => resolvePortal(this.userState()));

  get loginPath(): string {
    return this.config.loginPath;
  }

  /**
   * Loads GET /api/v1/me with the session cookie. A 401 is expected for
   * anonymous visitors and is returned as null instead of triggering the
   * global login redirect.
   */
  loadCurrentUser(): Observable<UserInfo | null> {
    if (this.loadedState()) {
      return of(this.userState());
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    const context = new HttpContext().set(SKIP_AUTH_REDIRECT, true);

    this.inFlight = this.http
      .get<UserInfo>(`${this.bffUrl('/api/v1/me')}`, {
        withCredentials: true,
        context,
      })
      .pipe(
        tap((user) => this.userState.set(user)),
        catchError(() => {
          this.userState.set(null);
          return of(null);
        }),
        finalize(() => {
          this.loadedState.set(true);
          this.inFlight = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.inFlight;
  }

  /** Full-page navigation to the BFF's OAuth2 authorization endpoint. */
  login(): void {
    window.location.href = this.authUrl('/oauth2/authorization/keycloak');
  }

  /** Full-page navigation to the BFF logout endpoint (GET /logout). */
  logout(): void {
    window.location.href = this.authUrl('/logout');
  }

  /**
   * Redirects the browser to the BFF login endpoint. Never sends the user
   * directly to Keycloak.
   */
  redirectToLogin(): void {
    if (this.redirecting) {
      return;
    }

    this.redirecting = true;
    this.login();
  }

  redirectToPortal(portal: Portal): void {
    const target = this.config.portals[portal];
    window.location.href = target || '/';
  }

  private bffUrl(path: string): string {
    const base = this.config.bffBaseUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }

  private authUrl(path: string): string {
    const base = this.config.authBaseUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }
}
