import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ignoreElements } from 'rxjs/operators';
import { User } from '../entity/user.interface';

@Injectable()
export class UserFirebaseService implements UserService {
  
  // Injection du service HTTPClient
  private readonly http = inject(HttpClient);
  
  // URL d'accès au projet sur Firebase
  private readonly FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${environment.firebaseConfig.projectId}/databases/(default)/documents`;

  // Identifiant de collection d'utilisateurs
  private readonly USER_COLLECTION_ID = 'users';

  // Clé d'API de Firebase (définie dans les variables d'environnement)
  private readonly FIREBASE_API_KEY = environment.firebaseConfig.apiKey
  
  // URL d'accès aux collections d'utilisateurs authentifiés sur Firebase
  private readonly USER_COLLECTION_URL = `${this.FIRESTORE_URL}/${this.USER_COLLECTION_ID}?key=${this.FIREBASE_API_KEY}&documentId=`;
  
  // Méthode de création d'un utilisateur sur Firebase
  create(user: User, bearerToken: string): Observable<void>{
    const url = `${this.USER_COLLECTION_URL}${user.id}`;
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
    return this.http.post(url, body, options).pipe(ignoreElements());
  }
}