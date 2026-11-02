import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface UserDoc {
  uid?: string;
  nome: string;
  email: string;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  users$: Observable<UserDoc[]> = collectionData(
    collection(this.firestore, 'users'),
    { idField: 'uid' }
  ) as Observable<UserDoc[]>;

  // Variáveis do formulário
  nome: string = '';
  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false; // Controlo de visibilidade da senha

  carregando: boolean = false;
  mensagemErro: string = '';
  mensagemSucesso: string = '';

  async cadastrarUsuario(): Promise<void> {
    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.senha
      );

      const uid = userCredential.user.uid;

      const userRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userRef, {
        uid: uid,
        nome: this.nome,
        email: this.email,
        criadoEm: new Date()
      });

      this.mensagemSucesso = 'Usuário cadastrado com sucesso!';

      this.nome = '';
      this.email = '';
      this.senha = '';
      this.mostrarSenha = false;
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.mensagemErro = 'Este e-mail já está cadastrado.';
      } else if (error.code === 'auth/weak-password') {
        this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      } else {
        this.mensagemErro = 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.';
      }
    } finally {
      this.carregando = false;
    }
  }
}