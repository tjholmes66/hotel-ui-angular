import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAME, APP_VERSION } from './app-info';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';
import { buildMenuSections } from './portal-menu';

const MOBILE_BREAKPOINT = 900;

@Component({
  selector: 'hotel-portal-shell',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-start">
          <button
            type="button"
            class="menu-button"
            aria-label="Toggle navigation"
            aria-controls="portal-sidebar"
            [attr.aria-expanded]="sidebarOpen()"
            (click)="toggleSidebar()"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <a class="brand" routerLink="/">{{ brand() }}</a>
        </div>

        <div class="topbar-end">
          <span class="user-meta">
            <span class="user-name">{{ displayName() }}</span>
            @if (username()) {
              <span class="user-username">&#64;{{ username() }}</span>
            }
          </span>

          <a class="profile-link" routerLink="/profile" routerLinkActive="active">Profile</a>
          <button type="button" class="sign-out" (click)="signOut()">Sign out</button>
        </div>
      </header>

      @if (sidebarOpen()) {
        <button
          type="button"
          class="sidebar-backdrop"
          aria-label="Close navigation"
          (click)="closeSidebar()"
        ></button>
      }

      <div class="body">
        <aside
          id="portal-sidebar"
          class="sidebar"
          [class.closed]="!sidebarOpen()"
          [attr.inert]="sidebarOpen() ? null : ''"
          [attr.aria-hidden]="!sidebarOpen()"
        >
          <div class="sidebar-head">
            <span>{{ portalLabel() }}</span>
            <button
              type="button"
              class="sidebar-close"
              aria-label="Close navigation"
              (click)="closeSidebar()"
            >
              Close
            </button>
          </div>

          <nav aria-label="Primary navigation">
            @for (section of menuSections(); track section.role) {
              <section class="menu-section">
                <h2>{{ section.header }}</h2>
                <ul>
                  @for (item of section.items; track item.path) {
                    <li>
                      <a
                        [routerLink]="item.path"
                        routerLinkActive="active"
                        [routerLinkActiveOptions]="{ exact: true }"
                        (click)="closeOnNavigate()"
                      >
                        {{ item.label }}
                      </a>
                    </li>
                  }
                </ul>
              </section>
            } @empty {
              <p>No navigation is available for this account.</p>
            }
          </nav>
        </aside>

        <main class="content">
          <ng-content />
        </main>
      </div>

      <footer class="footer">
        <span>&copy; {{ year }} {{ appName }}</span>
        <span>Version {{ appVersion }}</span>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .shell {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.8rem 1.25rem;
      background: color-mix(in srgb, var(--hotel-surface) 90%, transparent);
      border-bottom: 1px solid var(--hotel-border);
      backdrop-filter: blur(12px);
    }

    .topbar-start,
    .topbar-end {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand {
      color: var(--hotel-ink);
      font-family: var(--hotel-display-font);
      font-size: 1.05rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
    }

    .menu-button {
      width: 2.5rem;
      height: 2.5rem;
      display: grid;
      place-content: center;
      gap: 0.28rem;
      padding: 0;
      background: transparent;
      border: 1px solid var(--hotel-border);
      border-radius: 0.75rem;
      cursor: pointer;
    }

    .menu-button span {
      display: block;
      width: 1.1rem;
      height: 2px;
      background: var(--hotel-ink);
      border-radius: 999px;
    }

    .menu-button:hover,
    .menu-button:focus-visible {
      background: color-mix(in srgb, var(--hotel-brand) 8%, transparent);
      outline: none;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.2;
    }

    .user-name {
      color: var(--hotel-ink);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .user-username {
      color: var(--hotel-muted);
      font-size: 0.75rem;
    }

    .profile-link,
    .sign-out {
      padding: 0.55rem 0.95rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .profile-link {
      color: var(--hotel-brand);
      text-decoration: none;
      border: 1px solid color-mix(in srgb, var(--hotel-brand) 35%, transparent);
      transition:
        background 150ms ease,
        color 150ms ease;
    }

    .profile-link:hover,
    .profile-link.active {
      color: #fff;
      background: var(--hotel-brand);
    }

    .sign-out {
      color: #fff;
      background: var(--hotel-brand);
      border: 0;
      cursor: pointer;
    }

    .sign-out:hover {
      background: var(--hotel-brand-strong);
    }

    .profile-link:focus-visible,
    .sign-out:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--hotel-accent) 45%, transparent);
      outline-offset: 2px;
    }

    .body {
      flex: 1;
      display: flex;
      min-height: 0;
    }

    .sidebar {
      width: 18rem;
      flex: 0 0 18rem;
      padding: 1.25rem 1rem;
      overflow-y: auto;
      background: color-mix(in srgb, var(--hotel-surface) 94%, transparent);
      border-right: 1px solid var(--hotel-border);
    }

    .sidebar.closed {
      width: 0;
      flex-basis: 0;
      padding-inline: 0;
      border-right-width: 0;
      overflow: hidden;
    }

    .sidebar-head {
      display: none;
    }

    .menu-section + .menu-section {
      margin-top: 1.5rem;
    }

    .menu-section h2 {
      margin: 0 0 0.5rem;
      padding: 0 0.65rem;
      color: var(--hotel-muted);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .menu-section ul {
      display: grid;
      gap: 0.2rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .menu-section a {
      display: block;
      padding: 0.6rem 0.65rem;
      color: var(--hotel-ink);
      border-radius: 0.65rem;
      font-size: 0.9rem;
      text-decoration: none;
    }

    .menu-section a:hover {
      background: color-mix(in srgb, var(--hotel-brand) 8%, transparent);
    }

    .menu-section a.active {
      color: var(--hotel-brand-strong);
      background: color-mix(in srgb, var(--hotel-brand) 12%, transparent);
      font-weight: 600;
    }

    .content {
      flex: 1;
      min-width: 0;
      padding: clamp(1.25rem, 3vw, 2.5rem);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 1rem 1.5rem;
      color: var(--hotel-muted);
      border-top: 1px solid var(--hotel-border);
      font-size: 0.78rem;
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 900px) {
      .user-meta {
        display: none;
      }

      .body {
        display: block;
      }

      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 60;
        width: min(85vw, 20rem);
        flex-basis: auto;
        padding: 1.5rem 1rem;
        box-shadow: var(--hotel-shadow);
      }

      .sidebar.closed {
        width: min(85vw, 20rem);
        flex-basis: auto;
        padding-inline: 1rem;
        border-right: 1px solid var(--hotel-border);
        transform: translateX(-105%);
      }

      .sidebar-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding: 0 0.65rem;
        color: var(--hotel-ink);
        font-weight: 600;
      }

      .sidebar-close {
        padding: 0.35rem 0.65rem;
        color: var(--hotel-brand);
        background: transparent;
        border: 1px solid color-mix(in srgb, var(--hotel-brand) 35%, transparent);
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
      }

      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(31, 41, 51, 0.35);
        border: 0;
      }

      .content {
        padding: 1.25rem;
      }
    }
  `,
})
export class PortalShell {
  private readonly config = inject(AUTH_CONFIG);
  private readonly auth = inject(AuthService);

  private readonly storageKey = `hotel.sidebar.${this.config.portal}.open`;

  protected readonly user = this.auth.user;
  protected readonly appName = APP_NAME;
  protected readonly appVersion = APP_VERSION;
  protected readonly year = new Date().getFullYear();
  protected readonly sidebarOpen = signal(this.readInitialSidebarState());
  protected readonly menuSections = computed(() =>
    buildMenuSections(this.config.portal, this.auth.user()),
  );
  protected readonly brand = computed(() =>
    this.config.portal === 'guest' ? 'Grand Hotel - Guest Portal' : 'Grand Hotel - Staff Portal',
  );
  protected readonly portalLabel = computed(() =>
    this.config.portal === 'guest' ? 'Guest portal' : 'Staff portal',
  );
  protected readonly displayName = computed(() => {
    const user = this.auth.user();
    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return fullName || user?.username || 'Account';
  });
  protected readonly username = computed(() => this.auth.user()?.username ?? '');

  protected toggleSidebar(): void {
    const next = !this.sidebarOpen();
    this.sidebarOpen.set(next);
    this.persistSidebarState(next);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
    this.persistSidebarState(false);
  }

  protected closeOnNavigate(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT) {
      this.closeSidebar();
    }
  }

  protected signOut(): void {
    this.auth.logout();
  }

  private readInitialSidebarState(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {}

    return window.matchMedia?.(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`).matches ?? true;
  }

  private persistSidebarState(open: boolean): void {
    try {
      window.localStorage.setItem(this.storageKey, String(open));
    } catch {}
  }
}
