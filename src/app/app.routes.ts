import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'send',
    loadComponent: () =>
      import('./components/transaction/transaction').then((m) => m.TransactionComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/history/history').then((m) => m.HistoryComponent),
  },
  {
    path: 'networks',
    loadComponent: () =>
      import('./components/network-manager/network-manager').then((m) => m.NetworkManagerComponent),
  },
  { path: '**', redirectTo: '' },
];
