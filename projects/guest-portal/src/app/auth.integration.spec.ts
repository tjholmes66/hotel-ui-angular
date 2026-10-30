import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_CONFIG, AuthService, resolvePortal, UserInfo } from '@hotel/shared';

const guestUser: UserInfo = {
  username: 'guest1',
  email: 'guest1@example.com',
  firstName: 'Guest',
  lastName: 'User',
  keycloakId: 'keycloak-guest',
  roles: ['ROLE_GUEST'],
};

describe('AuthService', () => {
  let service: AuthService;
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
            portal: 'guest',
            portals: {
              guest: 'http://localhost:4200',
              staff: 'http://localhost:4201',
            },
            loginPath: '/login',
          },
        },
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads /api/v1/me with credentials and no Authorization header', () => {
    let result: UserInfo | null | undefined;

    service.loadCurrentUser().subscribe((user) => {
      result = user;
    });

    const request = httpMock.expectOne('/api/v1/me');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush(guestUser);
    expect(result).toEqual(guestUser);
  });

  it('treats a 401 from /api/v1/me as anonymous', () => {
    let result: UserInfo | null | undefined;

    service.loadCurrentUser().subscribe((user) => {
      result = user;
    });

    httpMock.expectOne('/api/v1/me').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(result).toBeNull();
  });
});

describe('resolvePortal', () => {
  it('routes ROLE_GUEST to the guest portal', () => {
    expect(resolvePortal(guestUser)).toBe('guest');
  });

  it('routes staff roles to the staff portal', () => {
    expect(resolvePortal({ ...guestUser, roles: ['ROLE_FRONT-DESK'] })).toBe('staff');
  });

  it('routes the full staff role set returned by /api/v1/me to the staff portal', () => {
    const staffRoles = [
      'ROLE_ADMIN',
      'ROLE_BELLHOP',
      'ROLE_CONCIERGE',
      'ROLE_FRONT-DESK',
      'ROLE_HOUSEKEEPING',
      'ROLE_KITCHEN',
      'ROLE_MAINTENANCE',
      'ROLE_PORTER',
    ];

    expect(resolvePortal({ ...guestUser, roles: staffRoles })).toBe('staff');
  });

  it('prefers staff when a user has both guest and staff roles', () => {
    expect(resolvePortal({ ...guestUser, roles: ['ROLE_GUEST', 'ROLE_HOUSEKEEPING'] })).toBe(
      'staff',
    );
  });

  it('treats unknown authenticated roles as staff', () => {
    expect(resolvePortal({ ...guestUser, roles: ['ROLE_MANAGER'] })).toBe('staff');
  });

  it('returns null for anonymous users', () => {
    expect(resolvePortal(null)).toBeNull();
  });
});
