import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Orcamento {
  id?: string;
  nomeProjeto?: string;
  cliente?: string;
  status?: string;
}

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css'
})
export class MenuLateralComponent {
  private firestore = inject(Firestore);

  // Busca apenas os orçamentos que estão com status 'Em produção'
  orcamentosEmAndamento$: Observable<Orcamento[]> = collectionData(
    query(
      collection(this.firestore, 'orcamentos'),
      where('status', '==', 'Em produção')
    ),
    { idField: 'id' }
  ) as Observable<Orcamento[]>;
}