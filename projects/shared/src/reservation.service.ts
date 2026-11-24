import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import {
  GuestRecord,
  ReservationRecord,
  ReservationSummary,
  ReservationWorkflow,
  RoomRecord,
} from './reservation.models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  searchByReservationNumber(reservationNumber: string): Observable<ReservationSummary[]> {
    const number = reservationNumber.trim();
    const url = this.url(
      `/api/v1/reservation/reservationNumber/${encodeURIComponent(number)}`,
    );

    return this.http.get<ReservationRecord>(url).pipe(
      catchError((error: unknown) => {
        if (isNotFound(error)) {
          return of(null);
        }

        return throwError(() => error);
      }),
      switchMap((reservation) => (reservation ? this.summaries([reservation]) : of([]))),
    );
  }

  searchByGuestLastName(
    lastName: string,
    date: string,
    workflow: ReservationWorkflow,
  ): Observable<ReservationSummary[]> {
    const name = lastName.trim();

    if (workflow === 'check-in') {
      const url = this.url(
        `/api/v1/reservation/primaryGuest/lastName/${encodeURIComponent(
          name,
        )}/checkinDate/${encodeURIComponent(date)}`,
      );

      return this.http
        .get<ReservationRecord[]>(url)
        .pipe(switchMap((reservations) => this.summaries(reservations ?? [])));
    }

    return forkJoin({
      guests: this.http.get<GuestRecord[]>(this.url('/api/v1/guest/search/lastname'), {
        params: { lastName: name },
      }),
      reservations: this.http.get<ReservationRecord[]>(this.url('/api/v1/reservation')),
    }).pipe(
      map(({ guests, reservations }) => {
        const guestIds = new Set((guests ?? []).map((guest) => guest.id));

        return (reservations ?? []).filter(
          (reservation) =>
            guestIds.has(reservation.primaryGuestId) &&
            isSameDate(reservation.checkoutDate, date),
        );
      }),
      switchMap((reservations) => this.summaries(reservations)),
    );
  }

  checkIn(reservationId: number): Observable<ReservationRecord> {
    return this.http.put<ReservationRecord>(this.url('/api/v1/reservation/checkin'), reservationId);
  }

  checkOut(reservationId: number): Observable<ReservationRecord> {
    return this.http.put<ReservationRecord>(
      this.url('/api/v1/reservation/checkout'),
      reservationId,
    );
  }

  private summaries(reservations: ReservationRecord[]): Observable<ReservationSummary[]> {
    if (reservations.length === 0) {
      return of([]);
    }

    return forkJoin(reservations.map((reservation) => this.summary(reservation)));
  }

  private summary(reservation: ReservationRecord): Observable<ReservationSummary> {
    return forkJoin({
      guest: this.guest(reservation.primaryGuestId),
      room: this.room(reservation.roomId),
    }).pipe(map(({ guest, room }) => ({ reservation, guest, room })));
  }

  private guest(guestId: number): Observable<GuestRecord | undefined> {
    return this.http
      .get<GuestRecord>(this.url(`/api/v1/guest/${guestId}`))
      .pipe(catchError(() => of(undefined)));
  }

  private room(roomId: number): Observable<RoomRecord | undefined> {
    return this.http
      .get<RoomRecord>(this.url(`/api/v1/room/${roomId}`))
      .pipe(catchError(() => of(undefined)));
  }

  private url(path: string): string {
    const base = this.config.bffBaseUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 404;
}

function isSameDate(value: string | undefined, date: string): boolean {
  return typeof value === 'string' && value.slice(0, 10) === date;
}
