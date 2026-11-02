import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../user/user';

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