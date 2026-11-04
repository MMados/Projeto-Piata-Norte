import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrcamentoService } from '../../services/orcamento.service';

/** Navegação do painel e resumo de orçamentos em produção. */
@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css'
})
export class MenuLateralComponent {
  private readonly orcamentoService = inject(OrcamentoService);

  readonly orcamentosEmAndamento$ = this.orcamentoService.obterOrcamentosEmProducao();
}