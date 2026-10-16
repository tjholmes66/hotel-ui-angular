import { inject, Injectable, signal } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  private readyPromise: Promise<boolean> | null = null;

  readonly isLoggedIn = signal(false);
  readonly accessToken = signal<string | null>(null);

  configure(config: AuthConfig): Promise<boolean> {
    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.readyPromise = this.oauthService
      .loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        this.syncState();
        return this.oauthService.hasValidAccessToken();
      })
      .catch(() => {
        this.syncState();
        return false;
      });
    return this.readyPromise;
  }

  whenReady(): Promise<boolean> {
    return this.readyPromise ?? Promise.resolve(this.oauthService.hasValidAccessToken());
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.isLoggedIn.set(false);
    this.accessToken.set(null);
    this.router.navigate(['/']);
  }

  async handleCallback(): Promise<void> {
    await this.whenReady();
    this.syncState();
    await this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  getUserName(): string {
    const claims = this.oauthService.getIdentityClaims() as { name?: string; preferred_username?: string } | null;
    return claims?.name ?? claims?.preferred_username ?? '';
  }

  private syncState(): void {
    const token = this.oauthService.getAccessToken();
    this.accessToken.set(token ?? null);
    this.isLoggedIn.set(this.oauthService.hasValidAccessToken());
  }
}
