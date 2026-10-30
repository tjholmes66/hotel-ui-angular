import { Routes } from '@angular/router';
import { FeaturePage, LoginPage, portalGuard, ProfilePage } from '@hotel/shared';
import { StaffHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'profile',
    canActivate: [portalGuard('staff')],
    component: ProfilePage,
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
