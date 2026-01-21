import { Routes } from '@angular/router';

import { AlertsPageComponent } from './pages/alerts-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { HistoryPageComponent } from './pages/history-page.component';
import { LandingPageComponent } from './pages/landing-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { PointDetailsPageComponent } from './pages/point-details-page.component';
import { PointsPageComponent } from './pages/points-page.component';
import { ProcessesPageComponent } from './pages/processes-page.component';
import { SupervisionPageComponent } from './pages/supervision-page.component';
import { TicketsPageComponent } from './pages/tickets-page.component';
import { MeasurementTypesPageComponent } from './pages/measurement-types-page.component';
import { PointTypesPageComponent } from './pages/point-types-page.component';
import { ConfigPageComponent } from './pages/config-page.component';
import { PointsConfigPageComponent } from './pages/points-config-page.component';
import { ThresholdsConfigPageComponent } from './pages/thresholds-config-page.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const authGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};

const loginGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return inject(Router).createUrlTree(['/dashboard']);
  }
  return true;
};

const landingGuard = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return inject(Router).createUrlTree(['/dashboard']);
  }
  return true;
};

const adminGuard = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) {
    return inject(Router).createUrlTree(['/login']);
  }
  if (auth.hasRole('ADMIN')) {
    return true;
  }
  return inject(Router).createUrlTree(['/dashboard']);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingPageComponent, canActivate: [landingGuard] },
  { path: 'login', component: LoginPageComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'supervision', component: SupervisionPageComponent, canActivate: [authGuard] },
  { path: 'alerts', component: AlertsPageComponent, canActivate: [authGuard] },
  { path: 'tickets', component: TicketsPageComponent, canActivate: [authGuard] },
  { path: 'points', component: PointsPageComponent, canActivate: [authGuard] },
  { path: 'points/:id', component: PointDetailsPageComponent, canActivate: [authGuard] },
  {
    path: 'config',
    component: ConfigPageComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'measurement-types' },
      { path: 'measurement-types', component: MeasurementTypesPageComponent },
      { path: 'point-types', component: PointTypesPageComponent },
      { path: 'points', component: PointsConfigPageComponent },
      { path: 'thresholds', component: ThresholdsConfigPageComponent }
    ]
  },
  {
    path: 'configuration',
    component: ConfigPageComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'measurement-types' },
      { path: 'measurement-types', component: MeasurementTypesPageComponent },
      { path: 'point-types', component: PointTypesPageComponent },
      { path: 'points', component: PointsConfigPageComponent },
      { path: 'thresholds', component: ThresholdsConfigPageComponent }
    ]
  },
  { path: 'measurement-types', redirectTo: 'config/measurement-types', pathMatch: 'full' },
  { path: 'point-types', redirectTo: 'config/point-types', pathMatch: 'full' },
  { path: 'processes', component: ProcessesPageComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
