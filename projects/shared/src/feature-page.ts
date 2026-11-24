import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { featureTitle } from './portal-menu';
import { PortalShell } from './portal-shell';

@Component({
  selector: 'hotel-feature-page',
  imports: [PortalShell, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hotel-portal-shell>
      <section class="feature">
        <a class="back-link" routerLink="/">Back to dashboard</a>

        <header class="feature-head">
          <p class="eyebrow">Workspace</p>
          <h1>{{ title() }}</h1>
          <p class="lede">
            This area is ready for the {{ title().toLowerCase() }} workflow. The navigation and
            layout are in place so the feature can be added here.
          </p>
        </header>

        <article class="card">
          <h2>Coming soon</h2>
          <p>
            Build the {{ title().toLowerCase() }} screens inside this content area. The portal
            shell, role menu and session handling are already connected.
          </p>
        </article>
      </section>
    </hotel-portal-shell>
  `,
  styles: `
    .feature {
      display: grid;
      gap: 1.25rem;
      max-width: 48rem;
    }

    .back-link {
      color: var(--hotel-brand);
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .feature-head {
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
      margin: 0 0 0.75rem;
      font-family: var(--hotel-display-font);
      font-size: 1.35rem;
    }

    .card p {
      margin: 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }
  `,
})
export class FeaturePage {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug'))), {
    initialValue: null,
  });

  protected readonly title = computed(() => featureTitle(this.slug()));
}
