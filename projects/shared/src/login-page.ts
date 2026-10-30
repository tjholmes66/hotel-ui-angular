import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';

@Component({
  selector: 'hotel-login-page',
  template: `
    <main class="login-shell">
      <section class="login-card">
        <p class="eyebrow">{{ portalLabel }}</p>
        <h1>{{ heading }}</h1>
        <p class="intro">{{ message }}</p>

        @if (showError) {
          <p class="error" role="alert">Sign-in could not be completed. Please try again.</p>
        }

        <button type="button" class="sign-in" (click)="signIn()">Continue with Keycloak</button>

        <p class="hint">
          You will be redirected to the hotel's secure identity provider. Your session is managed by
          the BFF using an HttpOnly cookie.
        </p>
      </section>
    </main>
  `,
  styles: `
    .login-shell {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
    }

    .login-card {
      width: min(100%, 30rem);
      padding: 2.5rem;
      background: var(--hotel-surface);
      border: 1px solid var(--hotel-border);
      border-radius: var(--hotel-radius);
      box-shadow: var(--hotel-shadow);
    }

    .eyebrow {
      margin: 0 0 0.75rem;
      color: var(--hotel-brand);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--hotel-ink);
      font-family: var(--hotel-display-font);
      font-size: clamp(1.75rem, 4vw, 2.35rem);
      line-height: 1.1;
    }

    .intro {
      margin: 1rem 0 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }

    .error {
      margin: 1.25rem 0 0;
      padding: 0.75rem 1rem;
      color: var(--hotel-danger);
      background: #fef3f2;
      border: 1px solid #fecdca;
      border-radius: 0.75rem;
      font-size: 0.9rem;
    }

    .sign-in {
      width: 100%;
      margin-top: 1.75rem;
      padding: 0.9rem 1.25rem;
      color: #fff;
      background: var(--hotel-brand);
      border: 0;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
      transition:
        background 150ms ease,
        transform 150ms ease;
    }

    .sign-in:hover {
      background: var(--hotel-brand-strong);
      transform: translateY(-1px);
    }

    .sign-in:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--hotel-accent) 45%, transparent);
      outline-offset: 2px;
    }

    .hint {
      margin: 1.25rem 0 0;
      color: var(--hotel-muted);
      font-size: 0.8rem;
      line-height: 1.5;
    }
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly config = inject(AUTH_CONFIG);
  private readonly route = inject(ActivatedRoute);

  protected readonly showError = this.route.snapshot.queryParamMap.has('error');
  protected readonly portalLabel = this.config.portal === 'staff' ? 'Staff portal' : 'Guest portal';
  protected readonly heading =
    this.config.portal === 'staff' ? 'Staff sign in' : 'Welcome to your stay';
  protected readonly message =
    this.config.portal === 'staff'
      ? 'Sign in with your hotel staff account to continue.'
      : 'Sign in to view your reservation and guest services.';

  protected signIn(): void {
    this.auth.login();
  }
}
