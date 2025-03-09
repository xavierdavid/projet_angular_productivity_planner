import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { User, Visitor } from '../entity/user.interface';
import { UserService } from '../repository/user.service';

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
  // Ajout d'une méthode register utilisant l'AuthenticationService
  withMethods((store, authenticationService = inject(AuthenticationService), userService = inject(UserService)) => ({
    register(visitor: Visitor ): void {
      authenticationService
        // Etape 1 : Appel de la méthode register de l'AuthenticationService - Demande d'un token
        .register(visitor.email, visitor.password)
        // Etape 2 : Actualisation de l'état (email) du store si la requête d'authentification réussit - Obtention d'un token
        .subscribe((response: { userId: any; jwtToken: any; }) =>  {
          // Création d'un objet utilisateur authentifié (avec son identifiant)
          const user: User = {
            id: response.userId,
            name: visitor.name,
            email: visitor.name
          }
          // Etape 3 : Enregistrement de l'état de l'objet User authentifié dans le Global Store (UserStore)
          userService.create(user, response.jwtToken).subscribe({
            next: () => {
              patchState(store, {user})
            }
          })
          // Etape 4 : Demande d'information sur l'objet User authentifié avec ajout systématique du token (Interceptor) 
          // Etape 5 : Récupération des données de l'objet User authentifé
        })
      },
    })
  )
);