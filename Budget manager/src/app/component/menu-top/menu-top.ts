import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../user/user';

/** Cabeçalho interno com o nome da página e o perfil do usuário. */
@Component({
  selector: 'app-menu-top',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './menu-top.html',
  styleUrl: './menu-top.css'
})
export class MenuTop{
  @Input() paginaAtual: string = '';
}