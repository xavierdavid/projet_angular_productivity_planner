import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../core/port/authentication.service';
import { UserStore } from '../../core/store/user.store';
import { Visitor } from '../../core/entity/user.interface';

@Component({
  imports: [FormsModule],
  templateUrl: './signup.page.component.html',
  styleUrl: './signup.page.component.scss',
})
export class SignupPageComponent {
  // Injection de dépendances et de services
  readonly authenticationService = inject(AuthenticationService);
  readonly store = inject(UserStore);
  
  // Propriétés d'entrée - Signaux
  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  // Propriété calculée 'computed' utilisant les signaux pour vérifier que les deux mots de passe sont identiques
  readonly isPasswordMatchValid = computed(
    () => this.password === this.confirmPassword
  );

  // Gestion de la soumission du formulaire d'inscription
  onSubmit() {
    // Création d'un nouvel objet User (Visitor non encore authentifié)
    const visitor: Visitor = {
      name: this.name(),
      email: this.email(),
      password: this.password(),
    } 
    // Enregistrement du nouvel utilisateur (Visitor) dans le Gobal Store
    this.store.register(visitor);
  }
}
