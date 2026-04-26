import { Routes } from '@angular/router';

export const aerobotRoutes: Routes = [
  {
    path : '',
    loadComponent : () => import('./pages/principal/principal')
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat')
  },
  {
    path: '**',
    redirectTo: ''
  }
]

export default aerobotRoutes;
