import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { User } from '../entity/user.interface';


// Contrat d'état de l'entité métier User (User peut être indéfini)
interface UserState {
  user: User | undefined;
}

// Global Store - Gestion réactive de l'état des données de l'utilisateur utilisant le signalStore d'Angular
export const UserStore = signalStore(
  { providedIn: 'root'},
  // Etat initial de l'entité métier User
  withState<UserState>({
   user: undefined,
  }),
  // Ajout d'une propriété calculée isGoogleUser
  withComputed((store) => {
    const isGoogleUser = computed(()=> !!store.user()?.email.endsWith('@google.com'));
    return {isGoogleUser}
  }),
  // Ajout d'une méthode register
  withMethods((store) => ({
    // Inscription et enregistrement de l'utilisateur dans le Global Store
    register(user: User): void {
      patchState(store, {user});
    },
  }))
);