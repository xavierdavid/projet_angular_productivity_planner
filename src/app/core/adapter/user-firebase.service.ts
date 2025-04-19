import { Injectable, inject } from '@angular/core';
import { UserService } from '../port/user.service';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { User } from '../entity/user.interface';

// Typage de la réponse de l'API de Firebase
interface UserFirebasePayload {
  fields: {
    name: { stringValue: string };
    email: { stringValue: string };
  };
}

@Injectable()
export class UserFirebaseService implements UserService {
  
  // Injection du service HTTPClient
  readonly #http = inject(HttpClient);
  
  // URL d'accès au projet sur Firebase
  readonly #FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${environment.firebaseConfig.projectId}/databases/(default)/documents`;

  // Identifiant de collection d'utilisateurs
  readonly #USER_COLLECTION_ID = 'users';

  // Clé d'API de Firebase (définie dans les variables d'environnement)
  readonly #FIREBASE_API_KEY = environment.firebaseConfig.apiKey
  
  // URL d'accès aux collections d'utilisateurs authentifiés sur Firebase
  readonly #USER_COLLECTION_URL = `${this.#FIRESTORE_URL}/${this.#USER_COLLECTION_ID}?key=${this.#FIREBASE_API_KEY}&documentId=`;
  
  // Méthode permettant de créer un nouvel utilisateur sur Firebase
  create(user: User, bearerToken: string): Observable<void>{
    const url = `${this.#USER_COLLECTION_URL}${user.id}`;
    // Body de la requête
    const body = {
      fields: {
        name: { stringValue: user.name },
        email: { stringValue: user.email },
      }
    };
    // Headers de la requête
    const headers = new HttpHeaders({
      Authorization: `Bearer ${bearerToken}`
    });
    // Options de la requête intègrant les headers
    const options = {headers};
    // Requête POST (on ignore les informations de retour)
    return this.#http.post(url, body, options).pipe(map(()=> undefined));
  }

  // Méthode permettant de récupérer un utilisateur sur Firebase
  fetch(userId: string): Observable<User> {
    const url = `${this.#FIRESTORE_URL}/${this.#USER_COLLECTION_ID}/${userId}?key=${this.#FIREBASE_API_KEY}`;
    // Requête GET 
    return this.#http.get<UserFirebasePayload>(url).pipe(
      map((response) => ({
        id: userId,
        name: response.fields.name.stringValue,
        email: response.fields.email.stringValue,
      }))   
    );
  }
}