import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../core/store/user.store';
import { Visitor } from '../../core/entity/user.interface';
import { RegisterUserUseCase } from './domain/register-user.use-case';
import { Router } from '@angular/router';
import { EmailAlreadyTakenError } from 'src/app/core/port/authentication.service';

@Component({
  imports: [FormsModule],
  templateUrl: './signup.page.component.html',
  styleUrl: './signup.page.component.scss',
})
export class SignupPageComponent {
  // Injection de dépendances et de services
  readonly store = inject(UserStore);
  readonly #registerUserUseCase = inject(RegisterUserUseCase);
  readonly #router = inject(Router);
  
  // Propriétés d'entrée - Signaux
  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly emailAlreadyTakenError = signal<EmailAlreadyTakenError|null>(null);
  readonly isEmailAlreadyTaken = computed(() => this.emailAlreadyTakenError()?.email === this.email());

  // Propriété calculée 'computed' utilisant les signaux pour vérifier que les deux mots de passe sont identiques
  readonly isPasswordMatch = computed(
    () => this.password() === this.confirmPassword()
  );

  // Gestion de la soumission du formulaire d'inscription
  onSubmit() {
    // On récupère le visiteur ayant soumis le formulaire
    const visitor : Visitor = {
      name: this.name(),
      email: this.email(),
      password: this.password()
    }
    // On exécute le RegisterUserUseCase
    this.#registerUserUseCase.execute(visitor)
    // On redirige l'utilisateur vers son dashboard
    .then(() => this.#router.navigate(['/app/dashboard']))
    .catch(error => {
      const isEmailAlreadyTaken = error instanceof EmailAlreadyTakenError;
      if(isEmailAlreadyTaken) {
        this.emailAlreadyTakenError.set(error);
      }
    });
  }
}
