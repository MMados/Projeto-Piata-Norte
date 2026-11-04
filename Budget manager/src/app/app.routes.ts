import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Formulario } from './pages/formulario/formulario';
import { Preview } from './pages/preview/preview';
import { NotFound } from './pages/not-found/not-found';
import { LadingPageComponent } from './pages/lading-page/lading-page';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Rotas públicas
  { path: '', component: LadingPageComponent },
  { path: 'login', component: Login },

  // Rotas protegidas (bloqueadas para quem não está logado)
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'orcamento', component: Formulario, canActivate: [authGuard] },
  { path: 'orcamento/:id', component: Formulario, canActivate: [authGuard] },
  { path: 'preview', component: Preview, canActivate: [authGuard] },
  { path: 'cadastro', component: Cadastro, canActivate: [authGuard]  },


  // Rota de erro / não encontrada
  { path: '**', component: NotFound },
];