# Hotel UI (Angular)

Angular workspace containing the two Hotel Management System UIs:

| App            | Default URL           | Roles                                                                                             |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------- |
| `guest-portal` | http://localhost:4200 | `GUEST`                                                                                           |
| `staff-portal` | http://localhost:4201 | `ADMIN`, `BELLHOP`, `CONCIERGE`, `FRONT-DESK`, `HOUSEKEEPING`, `KITCHEN`, `MAINTENANCE`, `PORTER` |

Both apps share the authentication implementation in `projects/shared/src`.

## Running locally

Start the Spring Boot BFF first (default `http://localhost:8080`), then:

```bash
npm run start:guest
npm run start:staff
```

Other scripts:

```bash
npm run build        # build both apps
npm run build:guest
npm run build:staff
npm run test         # guest portal tests
npm run test:staff
```

## BFF authentication integration

The UI is a BFF client. It never talks to Keycloak directly and never handles tokens.

- **Login** is a full-page navigation to
  `${bffBaseUrl}/oauth2/authorization/keycloak`. The BFF redirects to Keycloak,
  receives the callback, sets the HttpOnly `JSESSIONID`, then redirects to
  `app.ui.base-url`.
- **Startup** calls `GET /api/v1/me` with `withCredentials: true` to load the
  user and roles.
- **API calls** always use `withCredentials: true`. No `Authorization` header is
  sent, and `JSESSIONID` is never read or written by JavaScript.
- **CSRF**: Angular's XSRF support sends the `XSRF-TOKEN` cookie as
  `X-XSRF-TOKEN` for POST/PUT/PATCH/DELETE. The startup `GET /api/v1/me`
  guarantees the cookie exists before the first mutation.
- **401** responses redirect the browser to the BFF login URL
  (`/oauth2/authorization/keycloak`), never directly to Keycloak.
- **Logout** is a full-page navigation to `${bffBaseUrl}/logout`. The BFF now
  accepts `GET /logout` as well as `POST /logout`.

The dev proxy in `proxy.conf.js` forwards `/api`, `/oauth2`, `/login` and
`/logout` to the BFF so cookies stay first-party. `/login` is special-cased:
Angular renders `/login` (including `/login?error`), while
`/login/oauth2/**` is forwarded to Spring Security.

Override the BFF location when needed:

```powershell
$env:HOTEL_BFF_URL = "http://localhost:8080"
npm run start:guest
```

## Role-based portal routing

After `GET /api/v1/me`, the UI resolves the portal from the returned roles:

- A staff role sends the user to `staffPortalUrl`.
- `ROLE_GUEST` sends the user to `guestPortalUrl`.
- Staff roles take precedence if a user has both.

Portal URLs default to `http://localhost:4200` and `http://localhost:4201`.
Production deployments can override them (and `bffBaseUrl`) before the app
loads:

```html
<script>
  window.__HOTEL_CONFIG__ = {
    bffBaseUrl: '',
    guestPortalUrl: 'https://guest.hotel.example',
    staffPortalUrl: 'https://staff.hotel.example',
  };
</script>
```

## Building

```bash
npm run build
```

Build artifacts are written to `dist/guest-portal` and `dist/staff-portal`.
