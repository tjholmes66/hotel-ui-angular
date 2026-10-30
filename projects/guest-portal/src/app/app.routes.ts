import { Routes } from '@angular/router';
import { FeaturePage, LoginPage, portalGuard, ProfilePage } from '@hotel/shared';
import { GuestHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'profile',
    canActivate: [portalGuard('guest')],
    component: ProfilePage,
  },
  {
    path: 'feature/:slug',
    canActivate: [portalGuard('guest')],
    component: FeaturePage,
  },
  {
    path: '',
    canActivate: [portalGuard('guest')],
    component: GuestHomePage,
  },
  { path: '**', redirectTo: '' },
];
