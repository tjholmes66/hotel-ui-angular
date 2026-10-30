import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService, buildMenuSections, getUserRoles, PortalShell } from '@hotel/shared';

@Component({
  selector: 'staff-home-page',
  imports: [PortalShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hotel-portal-shell>
      <section class="home">
        <header class="hero">
          <p class="eyebrow">Staff portal</p>
          <h1>Welcome, {{ displayName() }}.</h1>
          <p class="lede">
            Your workspace is organized by role. Open a role in the navigation to find its
            functions, or use the role cards below.
          </p>
        </header>

        <div class="grid" aria-label="Staff roles and functions">
          @for (section of roleSections(); track section.role) {
            <article class="card">
              <h2>{{ section.header }}</h2>
              <ul>
                @for (item of section.items; track item.path) {
                  <li>{{ item.label }}</li>
                }
              </ul>
            </article>
          } @empty {
            <article class="card">
              <h2>No role assigned</h2>
              <p>Ask an administrator to assign a staff role to this account.</p>
            </article>
          }
        </div>

        <section class="roles" aria-label="Account roles">
          <h2>Your roles</h2>
          @if (roles().length > 0) {
            <ul>
              @for (role of roles(); track role) {
                <li>{{ role }}</li>
              }
            </ul>
          } @else {
            <p>No staff role assigned.</p>
          }
        </section>
      </section>
    </hotel-portal-shell>
  `,
  styles: `
    .home {
      display: grid;
      gap: 2rem;
    }

    .hero {
      max-width: 46rem;
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
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
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

    .card ul {
      display: grid;
      gap: 0.45rem;
      margin: 0;
      padding-left: 1.1rem;
      color: var(--hotel-muted);
      line-height: 1.5;
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

    .roles p {
      margin: 0;
      color: var(--hotel-muted);
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
  protected readonly roleSections = computed(() => buildMenuSections('staff', this.user()));
  protected readonly roles = computed(() =>
    getUserRoles(this.user()).map((role) => role.replace(/^ROLE_/, '').replaceAll('-', ' ')),
  );
}
