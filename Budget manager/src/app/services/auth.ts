import {
  EnvironmentInjector,
  Injectable,
  inject,
  runInInjectionContext,
} from '@angular/core';
import {
  Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from 'firebase/auth';
import { defer, Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

/** Centraliza a autenticação Firebase e a persistência do perfil do usuário. */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static accountAppSequence = 0;
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  /** Observa os perfis para a lista de colaboradores da área autenticada. */
  obterUsuarios(): Observable<Usuario[]> {
    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(collection(this.firestore, 'users'), {
          idField: 'uid',
        }) as Observable<Usuario[]>,
      ),
    );
  }

  /**
   * Cria a conta em uma instância Firebase secundária para preservar a sessão
   * autenticada atual e grava o perfil do novo colaborador.
   */
  async cadastrarUsuario(nome: string, email: string, senha: string): Promise<void> {
    const app = initializeApp(
      this.auth.app.options,
      `piata-user-creation-${Date.now()}-${++AuthService.accountAppSequence}`,
    );

    try {
      const secondaryAuth = getAuth(app);
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const credenciais = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
      await setDoc(doc(this.firestore, `users/${credenciais.user.uid}`), {
        uid: credenciais.user.uid,
        nome,
        email,
        criadoEm: new Date(),
      });
    } finally {
      await deleteApp(app);
    }
  }

  /** Autentica o usuário e registra a data do último acesso no Firestore. */
  async login(email: string, senha: string) {
    const credenciais = await signInWithEmailAndPassword(this.auth, email, senha);
    if (credenciais.user) {
      await this.salvarUsuarioFirestore(credenciais.user.uid, credenciais.user.email || email);
    }
    return credenciais;
  }

  /** Solicita ao Firebase o envio de uma redefinição de senha. */
  async redefinirSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  /** Mantém os dados básicos do perfil sem substituir outros campos existentes. */
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