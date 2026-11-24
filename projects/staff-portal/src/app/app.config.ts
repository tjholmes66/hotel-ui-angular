import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createAuthConfig, provideHotelAuth } from '@hotel/shared';
import { routes } from './app.routes';
import { provideNgxStripe } from 'ngx-stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHotelAuth(createAuthConfig('staff')),
    provideNgxStripe('pk_test_51UZLzg1NNs7pPdKaSTIm7h8triSFQqUpCVoX3DRGQ4rK5oPW3UPRv7FP8Ej4Q53b1EAQ8k4XVL5NR0RGjwjb9NkP00fv2Jhzs5')
  ],
};
