import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/**
 * Represents the payload of the response received when registering a new user in Firebase
 * 
 * @see https://firebase.google.com/docs/reference/rest/auth?hl=fr#section-create-email-password
 */
interface FirebaseResponseSignin {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

  /**
 * Represents the payload of the response received when authenticating a registered user in Firebase
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

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Injection du service HTTPClient dans la propriété de classe
  private readonly http = inject(HttpClient);

  // Requête d'inscription d'un nouvel utilisateur
  register(email:string, password:string): Observable<FirebaseResponseSignup> {
    // URL de requête d'inscription d'un nouvel utilisateur
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseConfig.apiKey}`
    // Body de la requête 
    const body = {email,password,"returnSecureToken":true};
    // Requête POST
    return this.http.post<FirebaseResponseSignup>(url,body);
  }

  // Requête d'authentification d'un utilisateur inscrit
  login(email: string, password: string): Observable<FirebaseResponseSignin> {
    // URL de requête d'authentification d'un utilisateur inscrit
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseConfig.apiKey}`;
    // Body de la requête
    const body = {email, password, returnSecureToken: true};
    // Requête POST
    return this.http.post<FirebaseResponseSignin>(url, body);
  }

  // Requête de sauvegarde d'un utilisateur authentifié
  save(email: string, userId: string, bearerToken: string): Observable<unknown> {
    // URL de requête de sauvegarde d'un utilisateur authentifié
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${environment.firebaseConfig.projectId}/databases/(default)/documents`;
    const userFirestoreCollectionId = 'users';
    const url = `${baseUrl}/${userFirestoreCollectionId}?key=${environment.firebaseConfig.apiKey}&documentId=${userId}`;
    // Body de la requête
    const body = {
      fields: {
        email: { stringValue: email },
      }
    };
    // Headers de la requête
    const headers = new HttpHeaders({
      Authorization: `Bearer ${bearerToken}`
    });
    // Options de la requête intègrant les headers
    const options = {headers};
    // Requête POST
    return this.http.post(url, body, options);
  }
}
