import { Component } from '@angular/core';

/** Apresenta links de contato pré-configurados para WhatsApp. */
@Component({
  selector: 'app-whatsapp-selector',
  standalone: true,
  templateUrl: './whatsapp-selector.html',
  styleUrl: './whatsapp-selector.css'
})
export class WhatsappSelectorComponent {
  mensagem = encodeURIComponent('Olá! Gostaria de fazer um orçamento.');

  contatos = [
    {
      nome: ' Mariano Alves ',
      descricao: 'Proprietário',
      numero: '5511918543085' 
    },
    {
      nome: 'Homero Pereira',
      descricao: 'Proprietário',
      numero: '5511964407514'
    }
  ];
}