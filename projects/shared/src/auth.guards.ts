import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { Portal, resolvePortal } from './auth.models';
import { AuthService } from './auth.service';

/**
 * Ensures the user is authenticated and belongs in the expected portal.
 * Anonymous users go to the BFF login flow; authenticated users in the other
 * portal are sent to that portal's URL.
 */
export const portalGuard =
  (expectedPortal: Portal): CanActivateFn =>
  () => {
    const auth = inject(AuthService);

    return auth.loadCurrentUser().pipe(
      map((user) => {
        if (!user) {
          auth.redirectToLogin();
          return false;
        }

        const actualPortal = resolvePortal(user);

        if (actualPortal === expectedPortal) {
          return true;
        }

        if (actualPortal) {
          auth.redirectToPortal(actualPortal);
        } else {
          auth.redirectToLogin();
        }

        return false;
      }),
    );
  };
