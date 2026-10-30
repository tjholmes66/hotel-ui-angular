import { Routes } from '@angular/router';
import { LoginPage, portalGuard } from '@hotel/shared';
import { StaffHomePage } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    canActivate: [portalGuard('staff')],
    component: StaffHomePage,
  },
  { path: '**', redirectTo: '' },
];
