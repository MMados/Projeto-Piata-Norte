import { Provider } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

/** Provides inert Firebase tokens for component tests that do not call the backend. */
export const firebaseTestProviders: Provider[] = [
  {
    provide: Auth,
    useValue: {
      onIdTokenChanged: (next: (user: null) => void) => {
        queueMicrotask(() => next(null));
        return () => {};
      },
    },
  },
  { provide: Firestore, useValue: {} },
];
