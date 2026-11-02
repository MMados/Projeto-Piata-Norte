import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, user, signOut } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface UserData {
  nome?: string;
  email?: string;
  uid?: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class HeaderComponent {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  userData$: Observable<UserData | null> = user(this.auth).pipe(
    switchMap(authUser => {
      if (authUser) {
        const userDocRef = doc(this.firestore, `users/${authUser.uid}`);
        return docData(userDocRef) as Observable<UserData>;
      }
      return of(null);
    })
  );

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  }
}