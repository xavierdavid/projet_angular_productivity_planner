import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Visitor } from '@app/core/entity/user.interface';
import { RegisterUserUseCase } from './domain/register-user.use-case';
import { EmailAlreadyTakenError } from './domain/email-already-taken.error';


@Component({
  imports: [FormsModule],
  templateUrl: './signup.page.component.html',
  styleUrl: './signup.page.component.scss',
})
export class SignupPageComponent {
  // Injection de dépendances et de services
  readonly #registerUserUseCase = inject(RegisterUserUseCase);
  
  // Propriétés d'entrée - Signaux
  readonly isLoading = signal(false);
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
    this.isLoading.set(true);
    // On récupère le visiteur ayant soumis le formulaire
    const visitor : Visitor = {
      name: this.name(),
      email: this.email(),
      password: this.password()
    }
    // On exécute le RegisterUserUseCase
    this.#registerUserUseCase.execute(visitor)
    // On attrappe les éventuelles erreurs
    .catch(error => {
      this.isLoading.set(false);
      const isEmailAlreadyTaken = error instanceof EmailAlreadyTakenError;
      if(isEmailAlreadyTaken) {
        this.emailAlreadyTakenError.set(error);
      }
    });
  }
}
