import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_CONFIG } from './auth.config';
import {
  GuestRecord,
  ReservationRecord,
  ReservationSummary,
  RoomRecord,
} from './reservation.models';
import { ReservationService } from './reservation.service';

const reservation: ReservationRecord = {
  id: 1,
  primaryGuestId: 10,
  roomId: 5,
  checkinDate: '2026-11-03',
  checkoutDate: '2026-11-05',
  numberAdults: 2,
  numberChildren: 0,
  reservationNumber: 'GH-1',
  statusId: 1,
};

const guest: GuestRecord = {
  id: 10,
  firstName: 'Ada',
  lastName: 'Smith',
  guestEmail: 'ada@example.com',
};

const room: RoomRecord = {
  id: 5,
  floor: 2,
  roomNumber: 203,
  roomName: 'Deluxe',
};

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AUTH_CONFIG,
          useValue: {
            bffBaseUrl: '',
            authBaseUrl: '',
            portal: 'staff',
            portals: {
              guest: 'http://localhost:4200',
              staff: 'http://localhost:4201',
            },
            loginPath: '/login',
          },
        },
        ReservationService,
      ],
    });

    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads a reservation by number and enriches it with guest and room details', () => {
    let result: ReservationSummary[] | undefined;

    service.searchByReservationNumber('GH-1').subscribe((summaries) => {
      result = summaries;
    });

    httpMock
      .expectOne('/api/v1/reservation/reservationNumber/GH-1')
      .flush(reservation);
    httpMock.expectOne('/api/v1/guest/10').flush(guest);
    httpMock.expectOne('/api/v1/room/5').flush(room);

    expect(result).toEqual([{ reservation, guest, room }]);
  });

  it('returns an empty list when the reservation number is not found', () => {
    let result: ReservationSummary[] | undefined;

    service.searchByReservationNumber('missing').subscribe((summaries) => {
      result = summaries;
    });

    httpMock
      .expectOne('/api/v1/reservation/reservationNumber/missing')
      .flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(result).toEqual([]);
  });

  it('searches arriving guests by last name and check-in date', () => {
    service.searchByGuestLastName('Smith', '2026-11-03', 'check-in').subscribe();

    httpMock
      .expectOne(
        '/api/v1/reservation/primaryGuest/lastName/Smith/checkinDate/2026-11-03',
      )
      .flush([reservation]);
    httpMock.expectOne('/api/v1/guest/10').flush(guest);
    httpMock.expectOne('/api/v1/room/5').flush(room);
  });

  it('searches departing guests by last name and check-out date', () => {
    let result: ReservationSummary[] | undefined;

    service.searchByGuestLastName('Smith', '2026-11-03', 'check-out').subscribe((summaries) => {
      result = summaries;
    });

    const guestsRequest = httpMock.expectOne((request) => {
      return (
        request.url === '/api/v1/guest/search/lastname' &&
        request.params.get('lastName') === 'Smith'
      );
    });
    const reservationsRequest = httpMock.expectOne('/api/v1/reservation');

    guestsRequest.flush([guest]);
    reservationsRequest.flush([
      { ...reservation, id: 1, checkoutDate: '2026-11-03' },
      { ...reservation, id: 2, checkoutDate: '2026-11-04' },
      { ...reservation, id: 3, primaryGuestId: 99, checkoutDate: '2026-11-03' },
    ]);

    httpMock.expectOne('/api/v1/guest/10').flush(guest);
    httpMock.expectOne('/api/v1/room/5').flush(room);

    expect(result?.map((summary) => summary.reservation.id)).toEqual([1]);
  });

  it('sends the reservation id as the check-in request body', () => {
    let result: ReservationRecord | undefined;

    service.checkIn(42).subscribe((updated) => {
      result = updated;
    });

    const request = httpMock.expectOne('/api/v1/reservation/checkin');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBe(42);
    request.flush({ ...reservation, id: 42 });

    expect(result?.id).toBe(42);
  });

  it('sends the reservation id as the check-out request body', () => {
    service.checkOut(43).subscribe();

    const request = httpMock.expectOne('/api/v1/reservation/checkout');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBe(43);
    request.flush({ ...reservation, id: 43 });
  });
});
