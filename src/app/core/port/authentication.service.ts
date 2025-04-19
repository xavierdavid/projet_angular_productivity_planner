import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationFirebaseService } from '../adapter/authentication-firebase.service';
import { EmailAlreadyTakenError } from '@app/visitor/signup/domain/email-already-taken.error';
import { InvalidPasswordError } from '@app/visitor/login/domain/invalid-password.error';
import { UserEmailNotFoundError } from '@app/visitor/login/domain/user-email-not-found-error';


// Contrat de données de la réponse attendue suite à l'inscription d'un nouvel utilisateur
export type RegisterResponse = RegisterPayload | EmailAlreadyTakenError;
interface RegisterPayload {
  jwtToken: string;
  jwtRefreshToken: string;
  expiresIn: string;
  userId: string;
} 

// Contrat de données de la réponse attendue suite à la connexion de l'utilisateur
export type LoginResponse = LoginPayload | InvalidCredentialError;
interface LoginPayload {
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
