import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService, getUserRoles, PortalShell } from '@hotel/shared';

@Component({
  selector: 'guest-home-page',
  imports: [PortalShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hotel-portal-shell>
      <section class="home">
        <header class="hero">
          <p class="eyebrow">Guest portal</p>
          <h1>Welcome back, {{ displayName() }}.</h1>
          <p class="lede">
            Your stay is in good hands. Use the navigation to review your reservation and access
            guest services.
          </p>
        </header>

        <div class="grid" aria-label="Guest services">
          <article class="card">
            <h2>Your account</h2>
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
            </dl>
          </article>

          <article class="card">
            <h2>Your reservation</h2>
            <p>
              Online check-in, room details and folio information will appear here once the
              reservation service is connected.
            </p>
          </article>

          <article class="card">
            <h2>Need anything?</h2>
            <p>
              The front desk can help with late check-out, dining, transport and local
              recommendations during your stay.
            </p>
          </article>
        </div>

        @if (roles().length > 0) {
          <section class="roles" aria-label="Account roles">
            <h2>Access</h2>
            <ul>
              @for (role of roles(); track role) {
                <li>{{ role }}</li>
              }
            </ul>
          </section>
        }
      </section>
    </hotel-portal-shell>
  `,
  styles: `
    .home {
      display: grid;
      gap: 2rem;
    }

    .hero {
      max-width: 44rem;
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
      font-size: clamp(2.25rem, 6vw, 3.75rem);
      line-height: 1.05;
    }

    .lede {
      margin: 1.25rem 0 0;
      max-width: 36rem;
      color: var(--hotel-muted);
      font-size: 1.05rem;
      line-height: 1.65;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 1.25rem;
    }

    .card {
      padding: 1.5rem;
      background: var(--hotel-surface);
      border: 1px solid var(--hotel-border);
      border-radius: var(--hotel-radius);
      box-shadow: var(--hotel-shadow);
    }

    .card h2,
    .roles h2 {
      margin: 0 0 1rem;
      font-family: var(--hotel-display-font);
      font-size: 1.35rem;
    }

    .card p {
      margin: 0;
      color: var(--hotel-muted);
      line-height: 1.6;
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
    }

    .roles {
      padding-top: 1.5rem;
      border-top: 1px solid var(--hotel-border);
    }

    .roles ul {
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
  `,
})
export class GuestHomePage {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly displayName = computed(() => {
    const user = this.user();
    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return fullName || user?.username || 'guest';
  });
  protected readonly roles = computed(() =>
    getUserRoles(this.user()).map((role) => role.replace(/^ROLE_/, '').replaceAll('-', ' ')),
  );
}
