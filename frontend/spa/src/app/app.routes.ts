import { Routes } from '@angular/router';

import { AlertsPageComponent } from './pages/alerts-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { HistoryPageComponent } from './pages/history-page.component';
import { PointDetailsPageComponent } from './pages/point-details-page.component';
import { PointsPageComponent } from './pages/points-page.component';
import { ProcessesPageComponent } from './pages/processes-page.component';
import { TicketsPageComponent } from './pages/tickets-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'alerts', component: AlertsPageComponent },
  { path: 'tickets', component: TicketsPageComponent },
  { path: 'points', component: PointsPageComponent },
  { path: 'points/:id', component: PointDetailsPageComponent },
  { path: 'processes', component: ProcessesPageComponent },
  { path: 'history', component: HistoryPageComponent },
  { path: '**', redirectTo: 'dashboard' }
];
