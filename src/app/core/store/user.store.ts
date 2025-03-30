import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { User, Visitor } from '../entity/user.interface';
import { AuthenticationService } from '../port/authentication.service';
import { UserService } from '../port/user.service';


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
  // Ajout de méthodes utilisant AuthenticationService et UserService
  withMethods(
    (
      store, 
      authenticationService = inject(AuthenticationService),
      userService = inject(UserService)
    ) => ({
      // Inscription d'un visiteur et enregistrement de l'utilisateur dans le store
      register(visitor: Visitor): void {
        authenticationService
          .register(visitor.email, visitor.password)
          .subscribe((response) => {
            const user: User = {
              id: response.userId,
              name: visitor.name,
              email: visitor.email,
            };
            userService.create(user, response.jwtToken).subscribe({
              next: () => {
                patchState(store, {user});
              },
            });
          });
      },
    })
  )
);