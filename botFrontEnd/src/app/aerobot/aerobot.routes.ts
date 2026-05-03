import { Routes } from '@angular/router';

export const aerobotRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/aerobot-layout/aerobot-layout'),
    children: [
      {
        path: 'new-chat',
        loadComponent: () => import('./pages/new-chat-page/new-chat-page')
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat')
      },
      {
        path: 'chat/:id',
        loadComponent: () => import('./pages/chat-by-id-page/chat-by-id-page')
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects-page/projects-page')
      },
      {
        path: 'skills',
        loadComponent: () => import('./pages/skills-page/skills-page')
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/new-chat'
  }
]

export default aerobotRoutes;
