import { Component, ElementRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

export interface Contato {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
}

type Campo = keyof Contato;

/** Texto só com espaços conta como vazio. */
function naoVazio(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

/** Telefone com DDD: 10 ou 11 dígitos. Campo vazio fica por conta do "required". */
function telefoneValido(control: AbstractControl): ValidationErrors | null {
  const digitos = String(control.value ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  return digitos.length === 10 || digitos.length === 11 ? null : { telefone: true };
}

/** Máscara de telefone: (11) 98765-4321 */
function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return '';
}

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Emite os dados quando o formulário é enviado com sucesso. */
  readonly enviar = output<Contato>();

  /** Controle de estados da requisição com Signals */
  readonly sucesso = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.group({
    nome: ['', [naoVazio]],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    telefone: ['', [Validators.required, telefoneValido]],
    mensagem: ['', [naoVazio]],
  });

  constructor() {
    // Reseta status ao modificar o formulário
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sucesso.set(false);
      this.erro.set(null);
    });

    // Aplica a máscara no telefone
    this.form.controls.telefone.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        const formatado = formatarTelefone(valor);
        if (formatado !== valor) {
          this.form.controls.telefone.setValue(formatado, { emitEvent: false });
        }
      });
  }

  /** O campo está inválido e já foi tocado (ou tentaram enviar)? */
  invalido(campo: Campo): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  mensagemErro(campo: Campo): string {
    const erros = this.form.controls[campo].errors;
    if (!erros) return '';

    switch (campo) {
      case 'nome':
        return 'Informe seu nome.';
      case 'email':
        return erros['required'] ? 'Informe seu e-mail.' : 'Digite um e-mail válido.';
      case 'telefone':
        return erros['required']
          ? 'Informe seu telefone.'
          : 'Digite DDD + número (10 ou 11 dígitos).';
      case 'mensagem':
        return 'Conte qual ambiente você quer transformar.';
    }
  }

  async aoEnviar(): Promise<void> {
    this.sucesso.set(false);
    this.erro.set(null);

    // Campos vazios ou inválidos: mostra os erros e foca no primeiro problema
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focarPrimeiroInvalido();
      return;
    }

    this.enviando.set(true);
    const valores = this.form.getRawValue();

    const dadosContato: Contato = {
      nome: valores.nome.trim(),
      email: valores.email.trim(),
      telefone: valores.telefone.trim(),
      mensagem: valores.mensagem.trim(),
    };

    try {
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        {
          nome: dadosContato.nome,
          email: dadosContato.email,
          telefone: dadosContato.telefone,
          mensagem: dadosContato.mensagem,
        },
        environment.emailjs.publicKey,
      );

      this.enviar.emit(dadosContato);
      this.form.reset();
      this.sucesso.set(true);
    } catch {
      console.error('Erro ao enviar e-mail via EmailJS.');
      this.erro.set('Não foi possível enviar no momento. Tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      this.enviando.set(false);
    }
  }

  private focarPrimeiroInvalido(): void {
    const ordem: Campo[] = ['nome', 'email', 'telefone', 'mensagem'];
    const primeiro = ordem.find((campo) => this.form.controls[campo].invalid);
    if (primeiro) {
      this.host.nativeElement.querySelector<HTMLElement>(`#${primeiro}`)?.focus();
    }
  }
}