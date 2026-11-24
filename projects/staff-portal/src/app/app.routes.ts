import { Routes } from '@angular/router';
import {
  FeaturePage,
  LoginPage,
  portalGuard,
  ProfilePage,
  ReservationWorkflowPage,
} from '@hotel/shared';
import { StaffHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'profile',
    canActivate: [portalGuard('staff')],
    component: ProfilePage,
  },
  {
    path: 'feature/check-in',
    canActivate: [portalGuard('staff')],
    component: ReservationWorkflowPage,
    data: { workflow: 'check-in' },
  },
  {
    path: 'feature/check-out',
    canActivate: [portalGuard('staff')],
    component: ReservationWorkflowPage,
    data: { workflow: 'check-out' },
  },
  {
    path: 'feature/:slug',
    canActivate: [portalGuard('staff')],
    component: FeaturePage,
  },
  {
    path: '',
    canActivate: [portalGuard('staff')],
    component: StaffHomePage,
  },
  { path: '**', redirectTo: '' },
];
