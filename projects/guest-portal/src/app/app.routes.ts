import { Routes } from '@angular/router';
import { LoginPage, portalGuard } from '@hotel/shared';
import { GuestHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    canActivate: [portalGuard('guest')],
    component: GuestHomePage,
  },
  { path: '**', redirectTo: '' },
];
