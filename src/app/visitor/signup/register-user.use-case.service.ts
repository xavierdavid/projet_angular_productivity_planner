import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User, Visitor } from 'src/app/core/entity/user.interface';
import { AuthenticationService, EmailAlreadyTakenError } from 'src/app/core/port/authentication.service';
import { UserService } from 'src/app/core/port/user.service';
import { UserStore } from 'src/app/core/store/user.store';

@Injectable({
  providedIn: 'root'
})
export class RegisterUserUseCaseService {

  // On récupère le port AuthenticationService
  readonly #authenticationService = inject(AuthenticationService);
  // On récupère le port UserService permettant de manager les données de l'utilisateur dans la base de données du backend
  readonly #userService = inject(UserService);
  // On récupère le UserStore
  readonly #userStore = inject(UserStore);
  
  // On exécute la requête asynchrone d'inscription du visiteur - Retourne un utilisateur
  async execute(visitor: Visitor): Promise<User> {
    // Etape 1 - Inscription d'un nouveau visiteur : la requête vers le backend retourne une réponse de type RegisterResponse
    const {name, email, password} = visitor;
    const registerResponse = await firstValueFrom(this.#authenticationService.register(email, password));
    
    if(registerResponse instanceof EmailAlreadyTakenError) {
      // On lève une erreur
      throw registerResponse;
    }
    
    // Etape 2 - On récupère les informations d'authentification de l'utilisateur envoyées par le Backend
    const jwtToken = registerResponse.jwtToken;
    const id = registerResponse.userId;
    
    // Etape 3 - On sauvegarde le token d'authentification et l'email de l'utilisateur dans le localStorage (session)
    localStorage.setItem('jwtToken', jwtToken); 
    localStorage.setItem('email', email); 
    
    // Etape 4 - On crée un nouvel objet User et on l'enregistre dans la base de données du backend 
    const user: User =  {id,name,email}
    await firstValueFrom(this.#userService.create(user, jwtToken));

    // Etape 5 - On sauvegarde l'utilisateur dans le UserStore (Global Store)
    this.#userStore.register(user);
    
    // Etape 6 - On retourne l'utilisateur
    return user;
  }
}
