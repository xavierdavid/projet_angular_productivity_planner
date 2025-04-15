import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AuthenticationService, LoginResponse, RegisterResponse } from '../port/authentication.service';
import { EmailAlreadyTakenError } from '@app/visitor/signup/domain/email-already-taken.error';


/**
 * Contrat de données de la réponse attendue suite à l'inscription d'un nouvel utilisateur sur Firebase
 * 
 * @see https://firebase.google.com/docs/reference/rest/auth?hl=fr#section-create-email-password
 */
interface FirebaseResponseSignin {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
}

/**
 * Contrat de données de la réponse attendue suite à l'authentification d'un utilisateur déjà inscrit sur Firebase
 * 
 * @see https://firebase.google.com/docs/reference/rest/auth?hl=fr#section-create-email-password
 */
interface FirebaseResponseSignup {
  displayName: string;
  email: string;
  expiresIn: string;
  idToken: string;
  localId: string;
  refreshToken: string;
  registered: boolean;
} 

// Adaptateur spécifique pour établir la liaison de Firebase avec le port d'entrée AuthenticationService
@Injectable()
export class AuthenticationFirebaseService implements AuthenticationService {

  // Injection du service HTTPClient dans la propriété de classe
  readonly #http = inject(HttpClient);

  // Requête d'inscription d'un nouvel utilisateur sur Firebase
  register(email:string, password:string): Observable<RegisterResponse> {
    // URL de requête d'inscription d'un nouvel utilisateur
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseConfig.apiKey}`
    // Body de la requête 
    const body = {email,password,"returnSecureToken":true};
    // Requête POST
    return this.#http.post<FirebaseResponseSignup>(url,body).pipe(
      map((response) => ({
        jwtToken: response.idToken,
        jwtRefreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        userId: response.localId,
      })),
      // Interception d'éventuelles erreurs 'métier' envoyées par le backend
      catchError(error => {
        if(error.error.error.message === 'EMAIL_EXISTS') {
          return of(new EmailAlreadyTakenError(email));
        } 
        return throwError(() => error);
      })
    );
  }

  // Requête d'authentification d'un utilisateur déjà inscrit sur Firebase
  login(email: string, password: string): Observable<LoginResponse> {
    // URL de requête d'authentification d'un utilisateur inscrit
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseConfig.apiKey}`;
    // Body de la requête
    const body = {email, password, returnSecureToken: true};
    // Requête POST
    return this.#http.post<FirebaseResponseSignin>(url, body).pipe(
      map(response => ({
        jwtToken: response.idToken,
        jwtRefreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        userId: response.localId,
        isRegistered: response.registered,
      }))
    );
  }
}

