import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AuthenticationService, LoginResponse, RegisterResponse } from '../port/authentication.service';
import { EmailAlreadyTakenError } from '@app/visitor/signup/domain/email-already-taken.error';
import { InvalidCredentialError } from '@app/visitor/login/domain/invalid-credential.error';


/**
 * Contrat de données de la réponse attendue suite à l'inscription d'un nouvel utilisateur sur Firebase
 * 
 * @see https://firebase.google.com/docs/reference/rest/auth?hl=fr#section-create-email-password
 */
interface FirebaseResponseSigninPayload {
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
interface FirebaseResponseSignupPayload {
  displayName: string;
  email: string;
  expiresIn: string;
  idToken: string;
  localId: string;
  refreshToken: string;
  registered: boolean;
} 
/**
 * Contrat de données du refreshToken fournipar Firebase
 */
export interface FirebaseRefreshTokenPayload {
  expires_in: string;
  token_type: string; // always "Bearer"
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
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
    return this.#http.post<FirebaseResponseSignupPayload>(url,body).pipe(
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
    return this.#http.post<FirebaseResponseSigninPayload>(url, body).pipe(
      map(response => ({
        jwtToken: response.idToken,
        jwtRefreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        userId: response.localId,
        isRegistered: response.registered,
      })),
      // Interception d'éventuelles erreurs 'métier' envoyées par le backend
      catchError(error => {
        if(error.error.error.message === 'INVALID_LOGIN_CREDENTIALS') {
          return of(new InvalidCredentialError());
        }
        return throwError(() => error);
      })
    );
  }
  // Requête permettant d'obtenir un nouvel JWT Token actualisé à partir du refreshToken de l'utilisateur 
  refreshToken(refreshToken: string): Observable<{ jwtToken: string, userId: string }> {
    const url = `https://securetoken.googleapis.com/v1/token?key=${environment.firebaseConfig.apiKey}`;
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .toString();

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.#http.post<FirebaseRefreshTokenPayload>(url, body, { headers }).pipe(
      map(response => ({ jwtToken: response.id_token, userId: response.user_id })),
    );
  }
}

