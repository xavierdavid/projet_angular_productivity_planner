import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationFirebaseService } from '../adapter/authentication-firebase.service';


// Contrat de données de la réponse attendue suite à l'inscription d'un nouvel utilisateur
export interface RegisterResponse {
  jwtToken: string;
  jwtRefreshToken: string;
  expiresIn: string;
  userId: string;
} 

// Gestion de l'erreur 'Email déjà existant'
export class EmailAlreadyTakenError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already taken. Please try another email.`);
    this.name = 'EmailAlreadyTakenError';
  }
}

// Contrat de données de la réponse attendue suite à la connexion de l'utilisateur
export interface LoginResponse {
  jwtToken: string;
  jwtRefreshToken: string;
  expiresIn: string;
  userId: string;
  isRegistered: boolean;
}

// Port d'entrée pour gérer la liaison avec les API Rest
@Injectable({
  providedIn: 'root',
  useClass: AuthenticationFirebaseService,
})
export abstract class AuthenticationService {

  // Requête d'inscription d'un nouvel utilisateur - Retourne une RegisterResponse ou une EmailAlreadyTakenError
  abstract register(email:string, password:string): Observable<RegisterResponse|EmailAlreadyTakenError>;

  // Requête d'authentification d'un utilisateur inscrit
  abstract login(email: string, password: string): Observable<LoginResponse>
}
