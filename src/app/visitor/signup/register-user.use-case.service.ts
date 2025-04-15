import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User, Visitor } from 'src/app/core/entity/user.interface';
import { AuthenticationService } from 'src/app/core/port/authentication.service';
import { UserService } from 'src/app/core/port/user.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserUseCaseService {

  // On récupère le port AuthenticationService
  readonly #authenticationService = inject(AuthenticationService);
  // On récupère le port UserService permettant de manager les données de l'utilisateur dans la base de données du backend
  readonly #userService = inject(UserService);
  
  // On exécute la requête asynchrone d'inscription du visiteur et on retourne soit un utilisateur, soit une erreur
  async execute(visitor: Visitor): Promise<User|Error> {
    // Etape 1 - Inscription d'un nouveau visiteur : la requête vers le backend retourne une réponse de type RegisterResponse
    const name = visitor.name;
    const email = visitor.email;
    const password = visitor.password;
    const authResponse = await firstValueFrom(this.#authenticationService.register(email, password));
    
    // Etape 2 - On récupère les informations d'authentification de l'utilisateur envoyées par le Backend
    const jwtToken = authResponse.jwtToken;
    const id = authResponse.userId;
    
    // Etape 3 - On sauvegarde le token d'authentification et l'email de l'utilisateur dans le localStorage (session)
    localStorage.setItem('jwtToken', jwtToken); 
    localStorage.setItem('email', email); 
    
    // Etape 4 - On crée un nouvel objet User et on l'enregistre dans la base de données du backend 
    const user: User =  {id,name,email}
    await firstValueFrom(this.#userService.create(user, jwtToken));

    // Etape 5 - On retourne l'utilisateur
    return user;
  }
}
