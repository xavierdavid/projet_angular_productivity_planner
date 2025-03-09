import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserFirebaseService } from './user-firebase.service';
import { User } from '../entity/user.interface';

// Management des données de l'entité User stockées sur Firebase - CRUD
@Injectable({
  providedIn: 'root',
  useClass: UserFirebaseService,
})
export abstract class UserService {
  
  // Création d'un utilisateur
  abstract create(user: User, bearerToken: string): Observable<void>;

  // Suppression d'un utilisateur
  //delete(user: User): Observable<void> {}
  // Modification d'un utilisateur
  //update(user: User): Observable<void> {}
  // Récupération d'un utilisateur à l'aide de son identifiant
  //fetch(id: string){}
}
