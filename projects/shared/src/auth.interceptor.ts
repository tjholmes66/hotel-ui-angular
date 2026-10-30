import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService, SKIP_AUTH_REDIRECT } from './auth.service';

/**
 * Adds the BFF session cookie to every request and redirects to the BFF
 * login URL when an API call returns 401. The Authorization header is never
 * added and JSESSIONID is never read or written by the UI.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const requestWithSession = request.clone({ withCredentials: true });

  return next(requestWithSession).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.context.get(SKIP_AUTH_REDIRECT)
      ) {
        auth.redirectToLogin();
      }

      return throwError(() => error);
    }),
  );
};
