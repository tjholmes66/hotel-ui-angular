import { Routes } from '@angular/router';
import {
  FeaturePage,
  LoginPage,
  portalGuard,
  ProfilePage,
  ReservationWorkflowPage,
} from '@hotel/shared';
import { GuestHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'profile',
    canActivate: [portalGuard('guest')],
    component: ProfilePage,
  },
  {
    path: 'feature/online-check-in',
    canActivate: [portalGuard('guest')],
    component: ReservationWorkflowPage,
    data: { workflow: 'check-in' },
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
