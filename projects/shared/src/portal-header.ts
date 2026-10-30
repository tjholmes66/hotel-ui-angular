import { Component, inject, input } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'hotel-portal-header',
  template: `
    <header class="portal-header">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>{{ brand() }}</span>
      </div>

      <div class="account">
        @if (user(); as currentUser) {
          <span class="account-copy">
            <span class="account-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            <span class="account-username">{{ currentUser.username }}</span>
          </span>
        }

        <button type="button" class="sign-out" (click)="signOut()">Sign out</button>
      </div>
    </header>
  `,
  styles: `
    .portal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: color-mix(in srgb, var(--hotel-surface) 88%, transparent);
      border-bottom: 1px solid var(--hotel-border);
      backdrop-filter: blur(12px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: var(--hotel-ink);
      font-family: var(--hotel-display-font);
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .brand-mark {
      width: 0.7rem;
      height: 1.5rem;
      background: var(--hotel-brand);
      border-radius: 999px;
    }

    .account {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .account-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.25;
    }

    .account-name {
      color: var(--hotel-ink);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .account-username {
      color: var(--hotel-muted);
      font-size: 0.75rem;
    }

    .sign-out {
      padding: 0.55rem 0.95rem;
      color: var(--hotel-brand);
      background: transparent;
      border: 1px solid color-mix(in srgb, var(--hotel-brand) 35%, transparent);
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        background 150ms ease,
        color 150ms ease;
    }

    .sign-out:hover {
      color: #fff;
      background: var(--hotel-brand);
    }

    @media (max-width: 520px) {
      .account-copy {
        display: none;
      }
    }
  `,
})
export class PortalHeader {
  readonly brand = input.required<string>();

  private readonly auth = inject(AuthService);
  protected readonly user = this.auth.user;

  protected signOut(): void {
    this.auth.logout();
  }
}
