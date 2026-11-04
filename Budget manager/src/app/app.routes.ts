import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Rotas públicas
  {
    path: '',
    loadComponent: () =>
      import('./pages/lading-page/lading-page').then((module) => module.LadingPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((module) => module.Login),
  },

  // Rotas protegidas (bloqueadas para quem não está logado)
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((module) => module.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'orcamento',
    loadComponent: () =>
      import('./pages/formulario/formulario').then((module) => module.Formulario),
    canActivate: [authGuard],
  },
  {
    path: 'orcamento/:id',
    loadComponent: () =>
      import('./pages/formulario/formulario').then((module) => module.Formulario),
    canActivate: [authGuard],
  },
  {
    path: 'preview',
    loadComponent: () => import('./pages/preview/preview').then((module) => module.Preview),
    canActivate: [authGuard],
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro').then((module) => module.Cadastro),
    canActivate: [authGuard],
  },

  // Rota de erro / não encontrada
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((module) => module.NotFound),
  },
];