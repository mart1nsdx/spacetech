import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/pages/landing-page/landing-page')
  },
  {
    path: 'aerobot',
    loadChildren: () => import('./aerobot/aerobot.routes')
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/pages/not-found-page/not-found-page')
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
