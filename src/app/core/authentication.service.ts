import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RegisterResponse {
  jwtToken: string;
  jwtRefreshToken: string;
  expiresIn: string;
  userId: string;
} 

export interface LoginResponse {
  jwtToken: string;
  jwtRefreshToken: string;
  expiresIn: string;
  userId: string;
  isRegistered: boolean;
}

@Injectable()
export abstract class AuthenticationService {

  // Requête d'inscription d'un nouvel utilisateur
  abstract register(email:string, password:string): Observable<RegisterResponse>

  // Requête d'authentification d'un utilisateur inscrit
  abstract login(email: string, password: string): Observable<LoginResponse>
}
