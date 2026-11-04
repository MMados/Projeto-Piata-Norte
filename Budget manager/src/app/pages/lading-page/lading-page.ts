import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappSelectorComponent } from '../../component/whatsapp-selector/whatsapp-selector';
import { ContactForm } from '../../component/contact-form/contact-form';

/** Página pública de apresentação e contato da marcenaria. */
@Component({
  selector: 'app-lading-page',
  standalone: true,
  imports: [WhatsappSelectorComponent, ContactForm, CommonModule],
  templateUrl: './lading-page.html',
  styleUrl: './lading-page.css'
})
export class LadingPageComponent {}