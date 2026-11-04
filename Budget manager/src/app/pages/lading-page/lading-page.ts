import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappSelectorComponent } from '../../component/whatsapp-selector/whatsapp-selector';
import { ContactForm } from '../../component/contact-form/contact-form';

@Component({
  selector: 'app-lading-page',
  standalone: true,
  imports: [WhatsappSelectorComponent,ContactForm, CommonModule], // <-- Adicione aqui
  templateUrl: './lading-page.html',
  styleUrl: './lading-page.css'
})
export class LadingPageComponent {}