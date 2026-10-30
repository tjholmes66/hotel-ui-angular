import { Component, computed, inject } from '@angular/core';
import { AuthService, getUserRoles, PortalHeader } from '@hotel/shared';

@Component({
  selector: 'staff-home-page',
  imports: [PortalHeader],
  template: `
    <div class="page">
      <hotel-portal-header brand="Grand Hotel - Staff Portal" />

      <main class="content">
        <section class="hero">
          <p class="eyebrow">Staff portal</p>
          <h1>Welcome, {{ displayName() }}.</h1>
          <p class="lede">
            You are signed in with a hotel staff account. Guest accounts are redirected to the guest
            portal automatically.
          </p>
        </section>

        <section class="grid" aria-label="Staff tools">
          <article class="card">
            <h2>Front desk</h2>
            <p>Reservation lookup, check-in and check-out workflows belong here.</p>
          </article>

          <article class="card">
            <h2>Housekeeping</h2>
            <p>Room status and cleaning assignment workflows belong here.</p>
          </article>

          <article class="card">
            <h2>Maintenance</h2>
            <p>Work orders and room maintenance workflows belong here.</p>
          </article>
        </section>

        <section class="roles" aria-label="Account roles">
          <h2>Your roles</h2>
          <ul>
            @for (role of roles(); track role) {
              <li>{{ role }}</li>
            } @empty {
              <li>No staff role assigned</li>
            }
          </ul>
        </section>
      </main>
    </div>
  `,
  styles: `
    .page {
      min-height: 100dvh;
    }

    .content {
      width: min(100%, 68rem);
      margin: 0 auto;
      padding: 3rem 1.5rem 4rem;
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
      max-width: 38rem;
      color: var(--hotel-muted);
      font-size: 1.05rem;
      line-height: 1.65;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 1.25rem;
      margin-top: 3rem;
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

    .roles {
      margin-top: 2rem;
      padding-top: 2rem;
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
export class StaffHomePage {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly displayName = computed(() => {
    const user = this.user();
    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return fullName || user?.username || 'team member';
  });
  protected readonly roles = computed(() =>
    getUserRoles(this.user()).map((role) => role.replace(/^ROLE_/, '').replaceAll('-', ' ')),
  );
}
