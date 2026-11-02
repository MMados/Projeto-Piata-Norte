import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  formularioLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required])
  });

  mensagemSucesso = '';
  mensagemErro = '';
  carregando = false;
  senhaVisivel = false;

  alternarSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  async validarLogin() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const email = this.formularioLogin.value.email!;
    const senha = this.formularioLogin.value.senha!;

    try {
      await this.authService.login(email, senha);
      this.mensagemSucesso = 'Login realizado com sucesso!';

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    } catch (error: any) {
      console.error('Erro de autenticação no Firebase:', error);
      this.tratarErroFirebase(error);
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  // Ação ao clicar em "Esqueci minha senha"
  async esqueciMinhaSenha() {
    const emailControl = this.formularioLogin.get('email');

    if (!emailControl?.value || emailControl.invalid) {
      this.mensagemErro = 'Digite um e-mail válido no campo de e-mail para redefinir a senha.';
      this.mensagemSucesso = '';
      emailControl?.markAsTouched();
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    try {
      await this.authService.redefinirSenha(emailControl.value);
      this.mensagemSucesso = 'E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.';
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      const codigo = error?.code || '';
      if (codigo.includes('user-not-found')) {
        this.mensagemErro = 'Nenhuma conta encontrada com este e-mail.';
      } else {
        this.mensagemErro = 'Erro ao enviar e-mail de redefinição. Verifique o e-mail digitado.';
      }
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  private tratarErroFirebase(error: any) {
    const codigo = error?.code || error?.message || String(error);

    if (
      codigo.includes('invalid-credential') ||
      codigo.includes('user-not-found') ||
      codigo.includes('wrong-password') ||
      codigo.includes('INVALID_LOGIN_CREDENTIALS') ||
      codigo.includes('400')
    ) {
      this.mensagemErro = 'E-mail ou palavra-passe incorretos.';
    } else if (codigo.includes('invalid-email')) {
      this.mensagemErro = 'Formato de e-mail inválido.';
    } else if (codigo.includes('too-many-requests')) {
      this.mensagemErro = 'Muitas tentativas falhadas. Tente novamente mais tarde.';
    } else {
      this.mensagemErro = 'Erro ao conectar ao Firebase. Verifique se o e-mail está registado na consola.';
    }
  }
}