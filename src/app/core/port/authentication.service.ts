import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationFirebaseService } from '../adapter/authentication-firebase.service';
import { EmailAlreadyTakenError } from '@app/visitor/signup/domain/email-already-taken.error';
import { InvalidCredentialError } from '@app/visitor/login/domain/invalid-credential.error';

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

  /**
   * Requête de récupération d'un nouveau jeton JWT Token à l'aide du refreshToken fourni
   * @param refreshToken - Permet de récupérer un nouveau JWT Token
   * @returns An Observable qui émet un nouveau JWT Token de type string
   */
  abstract refreshToken(refreshToken: string): Observable<{ jwtToken:string, userId:string}>;
}
