import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { errorCode } from '../../utils/error-code';

/** Tela interna de gestão dos perfis de usuário. */
@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  readonly users$ = this.authService.obterUsuarios();

  // Variáveis do formulário
  nome: string = '';
  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false; // Controlo de visibilidade da senha

  carregando: boolean = false;
  mensagemErro: string = '';
  mensagemSucesso: string = '';

  /** Valida os dados e delega ao serviço a criação da conta e do perfil. */
  async cadastrarUsuario(): Promise<void> {
    const nome = this.nome.trim();
    const email = this.email.trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!nome || !emailValido || this.senha.length < 6) {
      this.mensagemErro = 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.';
      this.mensagemSucesso = '';
      return;
    }

    if (this.carregando) return;
    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    try {
      await this.authService.cadastrarUsuario(nome, email, this.senha);

      this.mensagemSucesso = 'Usuário cadastrado com sucesso!';

      this.nome = '';
      this.email = '';
      this.senha = '';
      this.mostrarSenha = false;
    } catch (error: unknown) {
      const codigo = errorCode(error);
      console.error('Erro ao cadastrar:', codigo);
      if (codigo === 'auth/email-already-in-use') {
        this.mensagemErro = 'Este e-mail já está cadastrado.';
      } else if (codigo === 'auth/weak-password') {
        this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      } else {
        this.mensagemErro = 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.';
      }
    } finally {
      this.carregando = false;
    }
  }

}