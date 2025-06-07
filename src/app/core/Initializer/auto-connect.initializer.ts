import { concatMap, Observable } from 'rxjs';
import { tap } from 'rxjs';
import { AuthenticationService } from '@app/core/port/authentication.service';
import { UserService } from '@app/core/port/user.service';
import { UserStore } from '@app/core/store/user.store';

/**
 * Gestion de la connection automatique de l'utilisateur au lancement de l'application
 * @param authenticationService 
 * @param userService 
 * @param userStore 
 * @param router 
 * @returns 
 */
export function initializeAutoConnectFactory(
  authenticationService: AuthenticationService,
  userService: UserService,
  userStore: UserStore,
): () => Observable<void> {
  return () => new Observable<void>((observer) => {
    // Récupération d'un éventuel refreshToken de l'utilisateur
    const refreshToken = localStorage.getItem('jwtRefreshToken');
    // S'il n'y a pas de refreshToken, on démarre l'application
    if (!refreshToken) {
      observer.complete();
      return;
    }
    // Si un refreshToken existe, on l'utilise pour récupérer un nouveau JWT Token d'authentification à l'aide de a méthode refreshToken() de l'AuthentificationService
     authenticationService.refreshToken(refreshToken).pipe(
      tap(({ jwtToken }) => {
        // On met à jour le Local Storage avec le nouveau JWT Token
        localStorage.setItem('jwtToken', jwtToken)
      }),
      // On récupère les informations de l'utilisateur à l'aide du UserService
      concatMap(({ userId, jwtToken }) => userService.fetch(userId, jwtToken)),
     )
     .subscribe({
        next: (user) => {
          // On charge les informations de l'utilisateur dans le UserStore
          userStore.load(user);
          observer.complete();
        },
        error: () => {
          observer.complete();
        }
    });
  })
}