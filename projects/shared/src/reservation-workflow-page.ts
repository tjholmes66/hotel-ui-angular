import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import { PortalShell } from './portal-shell';
import {
  ReservationRecord,
  ReservationSearchMode,
  ReservationSummary,
  ReservationWorkflow,
} from './reservation.models';
import { ReservationService } from './reservation.service';

@Component({
  selector: 'hotel-reservation-workflow-page',
  imports: [PortalShell, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hotel-portal-shell>
      <section class="workflow">
        <a class="back-link" routerLink="/">Back to dashboard</a>

        <header class="workflow-head">
          <p class="eyebrow">{{ guestMode ? 'Guest portal' : 'Staff portal' }}</p>
          <h1>{{ title }}</h1>
          <p class="lede">{{ description }}</p>
        </header>

        @if (confirmation(); as confirmed) {
          <article class="card success" role="status">
            <p class="success-mark">{{ isCheckout ? 'Checked out' : 'Checked in' }}</p>
            <h2>{{ isCheckout ? 'Check-out complete' : 'Check-in complete' }}</h2>
            <p>
              Reservation <strong>{{ confirmed.reservation.reservationNumber }}</strong> for
              <strong>{{ guestName(confirmed) }}</strong> has been
              {{ isCheckout ? 'checked out' : 'checked in' }}.
            </p>

            <dl>
              <div>
                <dt>Guest</dt>
                <dd>{{ guestName(confirmed) }}</dd>
              </div>
              <div>
                <dt>Room</dt>
                <dd>{{ roomLabel(confirmed) }}</dd>
              </div>
              <div>
                <dt>{{ isCheckout ? 'Check-out' : 'Check-in' }} recorded</dt>
                <dd>{{ completionTime(confirmed) }}</dd>
              </div>
            </dl>

            <button type="button" class="primary" (click)="startOver()">
              Search another reservation
            </button>
          </article>
        } @else {
          <article class="card search-card">
            <h2>Find the reservation</h2>

            @if (guestMode) {
              <p class="hint">
                Enter the reservation number from your confirmation email. Only your reservation
                can be checked in from this page.
              </p>
            } @else {
              <p class="hint">
                Search by reservation number, or by the primary guest's last name. Last-name
                searches only return guests arriving or departing today.
              </p>

              <div class="mode-toggle" role="radiogroup" aria-label="Search by">
                <label [class.selected]="searchMode() === 'reservation'">
                  <input
                    type="radio"
                    name="searchMode"
                    value="reservation"
                    [checked]="searchMode() === 'reservation'"
                    (change)="selectSearchMode('reservation')"
                  />
                  Reservation number
                </label>
                <label [class.selected]="searchMode() === 'last-name'">
                  <input
                    type="radio"
                    name="searchMode"
                    value="last-name"
                    [checked]="searchMode() === 'last-name'"
                    (change)="selectSearchMode('last-name')"
                  />
                  Guest last name
                </label>
              </div>
            }

            <form (submit)="search($event)">
              @if (searchMode() === 'reservation') {
                <label class="field">
                  <span>Reservation number</span>
                  <input
                    type="text"
                    [value]="reservationNumber()"
                    (input)="onReservationNumber($event)"
                    placeholder="e.g. GH-123456"
                    autocomplete="off"
                  />
                </label>
              } @else {
                <label class="field">
                  <span>Guest last name</span>
                  <input
                    type="text"
                    [value]="lastName()"
                    (input)="onLastName($event)"
                    placeholder="e.g. Smith"
                    autocomplete="off"
                  />
                </label>
                <p class="date-note">
                  {{ isCheckout ? 'Check-out date' : 'Check-in date' }}:
                  <strong>{{ todayLabel }}</strong>
                </p>
              }

              <button class="primary" type="submit" [disabled]="!canSearch() || loading()">
                {{ loading() ? 'Searching...' : 'Search reservations' }}
              </button>
            </form>
          </article>

          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }

          @if (results().length > 0) {
            <section class="results" aria-label="Matching reservations">
              <header class="results-head">
                <h2>
                  {{ results().length === 1 ? '1 reservation found' : results().length + ' reservations found' }}
                </h2>
                <p>
                  Confirm the reservation details before completing the
                  {{ isCheckout ? 'check-out' : 'check-in' }}.
                </p>
              </header>

              @for (summary of results(); track summary.reservation.id) {
                <article class="card reservation">
                  <div class="reservation-head">
                    <div>
                      <p class="label">Reservation</p>
                      <h3>{{ summary.reservation.reservationNumber }}</h3>
                    </div>
                    <span class="badge">{{ guestName(summary) }}</span>
                  </div>

                  <dl>
                    <div>
                      <dt>Guest</dt>
                      <dd>{{ guestName(summary) }}</dd>
                    </div>
                    <div>
                      <dt>Contact</dt>
                      <dd>{{ guestContact(summary) }}</dd>
                    </div>
                    <div>
                      <dt>Room</dt>
                      <dd>{{ roomLabel(summary) }}</dd>
                    </div>
                    <div>
                      <dt>Stay</dt>
                      <dd>
                        {{ formatDate(summary.reservation.checkinDate) }} &rarr;
                        {{ formatDate(summary.reservation.checkoutDate) }}
                      </dd>
                    </div>
                    <div>
                      <dt>Occupancy</dt>
                      <dd>
                        {{ summary.reservation.numberAdults }} adult(s),
                        {{ summary.reservation.numberChildren }} child(ren)
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    class="primary"
                    [disabled]="submittingId() !== null"
                    (click)="confirm(summary)"
                  >
                    {{ submitLabel(summary) }}
                  </button>
                </article>
              }
            </section>
          }
        }
      </section>
    </hotel-portal-shell>
  `,
  styles: `
    .workflow {
      display: grid;
      gap: 1.25rem;
      max-width: 52rem;
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

    .workflow-head {
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

    .search-card {
      display: grid;
      gap: 1rem;
    }

    .search-card h2 {
      margin-bottom: 0;
    }

    .hint {
      margin: 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }

    .mode-toggle {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .mode-toggle label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 0.9rem;
      color: var(--hotel-ink);
      background: var(--hotel-bg);
      border: 1px solid var(--hotel-border);
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
    }

    .mode-toggle label.selected {
      color: var(--hotel-brand-strong);
      background: color-mix(in srgb, var(--hotel-brand) 10%, transparent);
      border-color: color-mix(in srgb, var(--hotel-brand) 45%, transparent);
    }

    .mode-toggle input {
      accent-color: var(--hotel-brand);
    }

    form {
      display: grid;
      gap: 1rem;
      justify-items: start;
    }

    .field {
      display: grid;
      gap: 0.4rem;
      width: 100%;
      max-width: 30rem;
    }

    .field span {
      color: var(--hotel-muted);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .field input {
      width: 100%;
      padding: 0.7rem 0.85rem;
      color: var(--hotel-ink);
      background: var(--hotel-surface);
      border: 1px solid var(--hotel-border);
      border-radius: 0.75rem;
    }

    .field input:focus {
      border-color: var(--hotel-brand);
      outline: 3px solid color-mix(in srgb, var(--hotel-accent) 35%, transparent);
      outline-offset: 1px;
    }

    .date-note {
      margin: 0;
      color: var(--hotel-muted);
      font-size: 0.9rem;
    }

    .primary {
      padding: 0.75rem 1.25rem;
      color: #fff;
      background: var(--hotel-brand);
      border: 0;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary:hover:not(:disabled) {
      background: var(--hotel-brand-strong);
    }

    .primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .primary:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--hotel-accent) 45%, transparent);
      outline-offset: 2px;
    }

    .error {
      margin: 0;
      padding: 0.85rem 1rem;
      color: var(--hotel-danger);
      background: #fef3f2;
      border: 1px solid #fecdca;
      border-radius: 0.75rem;
      line-height: 1.5;
    }

    .results {
      display: grid;
      gap: 1rem;
    }

    .results-head h2 {
      margin: 0;
      font-family: var(--hotel-display-font);
      font-size: 1.35rem;
    }

    .results-head p {
      margin: 0.35rem 0 0;
      color: var(--hotel-muted);
    }

    .reservation {
      display: grid;
      gap: 1.25rem;
    }

    .reservation-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .label {
      margin: 0;
      color: var(--hotel-muted);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .reservation h3 {
      margin: 0.2rem 0 0;
      font-family: var(--hotel-display-font);
      font-size: 1.5rem;
    }

    .badge {
      padding: 0.4rem 0.8rem;
      color: var(--hotel-brand);
      background: color-mix(in srgb, var(--hotel-brand) 8%, transparent);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
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

    .success {
      display: grid;
      gap: 1rem;
      justify-items: start;
    }

    .success p {
      margin: 0;
      color: var(--hotel-muted);
      line-height: 1.6;
    }

    .success-mark {
      color: var(--hotel-brand) !important;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .success dl {
      width: 100%;
    }
  `,
})
export class ReservationWorkflowPage {
  private readonly route = inject(ActivatedRoute);
  private readonly config = inject(AUTH_CONFIG);
  private readonly reservationService = inject(ReservationService);

  private readonly workflow: ReservationWorkflow =
    this.route.snapshot.data['workflow'] === 'check-out' ? 'check-out' : 'check-in';

  protected readonly guestMode = this.config.portal === 'guest';
  protected readonly isCheckout = this.workflow === 'check-out';
  protected readonly title = this.guestMode
    ? 'Online check-in'
    : this.isCheckout
      ? 'Check out guest'
      : 'Check in guest';
  protected readonly description = this.guestMode
    ? 'Enter your reservation number to review your stay and complete check-in.'
    : this.isCheckout
      ? "Look up today's departing reservation by number or the primary guest's last name, confirm the details, then check the guest out."
      : "Look up today's arriving reservation by number or the primary guest's last name, confirm the details, then check the guest in.";

  private readonly today = new Date();

  protected readonly todayIso = formatDateOnly(this.today);
  protected readonly todayLabel = formatDisplayDate(this.today);

  protected readonly searchMode = signal<ReservationSearchMode>('reservation');
  protected readonly reservationNumber = signal('');
  protected readonly lastName = signal('');
  protected readonly loading = signal(false);
  protected readonly submittingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly results = signal<ReservationSummary[]>([]);
  protected readonly confirmation = signal<ReservationSummary | null>(null);
  protected readonly canSearch = computed(() =>
    this.searchMode() === 'reservation'
      ? this.reservationNumber().trim().length > 0
      : this.lastName().trim().length > 0,
  );

  protected selectSearchMode(mode: ReservationSearchMode): void {
    this.searchMode.set(mode);
    this.error.set(null);
    this.results.set([]);
    this.confirmation.set(null);
  }

  protected onReservationNumber(event: Event): void {
    this.reservationNumber.set((event.target as HTMLInputElement).value);
  }

  protected onLastName(event: Event): void {
    this.lastName.set((event.target as HTMLInputElement).value);
  }

  protected search(event: Event): void {
    event.preventDefault();

    if (this.loading() || !this.canSearch()) {
      return;
    }

    this.error.set(null);
    this.results.set([]);
    this.confirmation.set(null);
    this.loading.set(true);

    const request =
      this.searchMode() === 'reservation'
        ? this.reservationService.searchByReservationNumber(this.reservationNumber())
        : this.reservationService.searchByGuestLastName(
            this.lastName(),
            this.todayIso,
            this.workflow,
          );

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (summaries) => {
        this.results.set(summaries);

        if (summaries.length === 0) {
          this.error.set(this.noResultsMessage());
        }
      },
      error: () => {
        this.error.set('We could not search for reservations. Please try again.');
      },
    });
  }

  protected confirm(summary: ReservationSummary): void {
    if (this.submittingId() !== null) {
      return;
    }

    const reservationId = summary.reservation.id;
    this.submittingId.set(reservationId);
    this.error.set(null);

    const request = this.isCheckout
      ? this.reservationService.checkOut(reservationId)
      : this.reservationService.checkIn(reservationId);

    request.pipe(finalize(() => this.submittingId.set(null))).subscribe({
      next: (reservation: ReservationRecord) => {
        this.confirmation.set({ ...summary, reservation });
        this.results.set([]);
      },
      error: () => {
        this.error.set(
          this.isCheckout
            ? 'The guest could not be checked out. Please verify the reservation and try again.'
            : 'The guest could not be checked in. Please verify the reservation and try again.',
        );
      },
    });
  }

  protected startOver(): void {
    this.confirmation.set(null);
    this.results.set([]);
    this.error.set(null);
    this.reservationNumber.set('');
    this.lastName.set('');
    this.searchMode.set('reservation');
  }

  protected submitLabel(summary: ReservationSummary): string {
    if (this.submittingId() === summary.reservation.id) {
      return this.isCheckout ? 'Checking out...' : 'Checking in...';
    }

    return this.isCheckout ? 'Confirm check-out' : 'Confirm check-in';
  }

  protected guestName(summary: ReservationSummary): string {
    const guest = summary.guest;

    if (!guest) {
      return `Guest #${summary.reservation.primaryGuestId}`;
    }

    const name = `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim();
    return name || `Guest #${summary.reservation.primaryGuestId}`;
  }

  protected guestContact(summary: ReservationSummary): string {
    const guest = summary.guest;
    const contact = [guest?.guestEmail, guest?.guestPhone].filter(Boolean).join(' · ');
    return contact || 'No contact details available';
  }

  protected roomLabel(summary: ReservationSummary): string {
    const room = summary.room;

    if (!room) {
      return `Room #${summary.reservation.roomId}`;
    }

    const name = room.roomName ? ` · ${room.roomName}` : '';
    const floor = room.floor !== undefined ? ` · Floor ${room.floor}` : '';
    return `Room ${room.roomNumber}${name}${floor}`;
  }

  protected formatDate(value: string | undefined): string {
    return value ? formatDisplayDate(value) : '—';
  }

  protected completionTime(summary: ReservationSummary): string {
    const value = this.isCheckout
      ? summary.reservation.actualCheckout
      : summary.reservation.actualCheckin;

    return value ? this.formatDateTime(value) : 'Just now';
  }

  protected formatDateTime(value: string | undefined): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }

  private noResultsMessage(): string {
    if (this.searchMode() === 'reservation') {
      return 'No reservation matched that number.';
    }

    return this.isCheckout
      ? `No reservations were found for that last name checking out on ${this.todayLabel}.`
      : `No reservations were found for that last name checking in on ${this.todayLabel}.`;
  }
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '—';
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
