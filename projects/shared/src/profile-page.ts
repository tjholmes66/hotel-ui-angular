import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { getUserRoles } from './auth.models';
import { PortalShell } from './portal-shell';

@Component({
  selector: 'hotel-profile-page',
  imports: [PortalShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hotel-portal-shell>
      <section class="profile">
        <header class="profile-head">
          <p class="eyebrow">Account</p>
          <h1>Your profile</h1>
          <p class="lede">Profile details come from the BFF session and Keycloak identity.</p>
        </header>

        <article class="card">
          <h2>Personal details</h2>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{{ displayName() }}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{{ user()?.username || 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ user()?.email || 'Not provided' }}</dd>
            </div>
            <div>
              <dt>Keycloak ID</dt>
              <dd>{{ user()?.keycloakId || 'Not provided' }}</dd>
            </div>
          </dl>
        </article>

        <article class="card">
          <h2>Roles</h2>
          @if (roles().length > 0) {
            <ul class="roles">
              @for (role of roles(); track role) {
                <li>{{ role }}</li>
              }
            </ul>
          } @else {
            <p>No roles were returned for this account.</p>
          }
        </article>
      </section>
    </hotel-portal-shell>
  `,
  styles: `
    .profile {
      display: grid;
      gap: 1.25rem;
      max-width: 48rem;
    }

    .profile-head {
      max-width: 40rem;
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
      font-family: var(--hotel-display-font);
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.05;
    }

    .lede {
      margin: 0.85rem 0 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }

    .card {
      padding: 1.5rem;
      background: var(--hotel-surface);
      border: 1px solid var(--hotel-border);
      border-radius: var(--hotel-radius);
      box-shadow: var(--hotel-shadow);
    }

    .card h2 {
      margin: 0 0 1rem;
      font-family: var(--hotel-display-font);
      font-size: 1.35rem;
    }

    dl {
      display: grid;
      gap: 0.85rem;
      margin: 0;
    }

    dt {
      color: var(--hotel-muted);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    dd {
      margin: 0.2rem 0 0;
      color: var(--hotel-ink);
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    .roles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .roles li {
      padding: 0.4rem 0.8rem;
      color: var(--hotel-brand);
      background: color-mix(in srgb, var(--hotel-brand) 8%, transparent);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .card p {
      margin: 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }
  `,
})
export class ProfilePage {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly displayName = computed(() => {
    const user = this.user();
    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return fullName || user?.username || 'Account';
  });
  protected readonly roles = computed(() => getUserRoles(this.user()));
}
