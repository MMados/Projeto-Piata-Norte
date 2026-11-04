import { Component, Input } from "@angular/core";
import { NgClass } from '@angular/common';

/** Cartão reutilizável de resumo com rótulo, valor e texto auxiliar. */
@Component({
  imports: [NgClass],
  selector: "app-card-summary",
  styleUrl: "./card-summary.css",
  templateUrl: "./card-summary.html",
})
export class CardSummary {
  @Input() label: string = 'Padrão';
  @Input() number: number = 0;
  @Input() sub: string = 'Padrão';

}
