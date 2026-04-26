import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'aerobot',
    loadChildren: () => import('./aerobot/aerobot.routes')
  },
  {
    path: '**',
    redirectTo: 'aerobot'
  }
];
