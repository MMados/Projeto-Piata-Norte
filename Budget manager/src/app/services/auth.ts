import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Iniciar sessão
  async login(email: string, senha: string) {
    const credenciais = await signInWithEmailAndPassword(this.auth, email, senha);
    if (credenciais.user) {
      await this.salvarUsuarioFirestore(credenciais.user.uid, credenciais.user.email || email);
    }
    return credenciais;
  }

  // Enviar e-mail de redefinição de senha
  async redefinirSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  // Guardar/Atualizar dados no Firestore
  async salvarUsuarioFirestore(uid: string, email: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const dadosUsuario: Partial<Usuario> = {
      uid,
      email,
      ultimoAcesso: serverTimestamp()
    };
    await setDoc(userRef, dadosUsuario, { merge: true });
  }
}