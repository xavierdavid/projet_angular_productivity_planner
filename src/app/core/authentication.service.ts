import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';
import { Observable } from 'rxjs';

/**
 * Represents the payload of the response received when registering a new user in Firebase
 * 
 * @see https://firebase.google.com/docs/reference/rest/auth?hl=fr#section-create-email-password
 */
interface FirebaseResponseRegister {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
} 

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Injection du service HTTPClient dans la propriété de classe
  private readonly http = inject(HttpClient);

  // Requête d'inscription d'un nouvel utilisateur
  register(email:string, password:string): Observable<FirebaseResponseRegister> {
    // URL de requête d'inscription d'un nouvel utilisateur
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseConfig.apiKey}`
    // Body de la requête 
    const body = {email,password,"returnSecureToken":true};
    // Requête POST
    return this.http.post<FirebaseResponseRegister>(url,body);
  }
}
