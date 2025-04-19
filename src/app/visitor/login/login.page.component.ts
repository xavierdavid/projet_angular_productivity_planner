import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginUserUseCase } from './domain/login-user.use-case';
import { UserEmailNotFoundError } from './domain/user-email-not-found-error';
import { InvalidPasswordError } from './domain/invalid-password.error';

@Component({
  imports: [FormsModule],
  templateUrl: './login.page.component.html',
  styleUrl: './login.page.component.scss'
})
export class LoginPageComponent {
  readonly #loginUserUseCase = inject(LoginUserUseCase)
  readonly email = signal('');
  readonly password = signal('');
  readonly userEmailNotFoundError = signal<UserEmailNotFoundError|null>(null);
  readonly invalidPasswordError = signal<InvalidPasswordError|null>(null);

  // Gestion de la soumission du formulaire de connexion
  onSubmit() {
    this.#loginUserUseCase.execute(this.email(), this.password()).catch(error => {
      if(error instanceof UserEmailNotFoundError) {
        this.userEmailNotFoundError.set(error);
      }

      if(error instanceof InvalidPasswordError) {
        this.invalidPasswordError.set(error);
      } 
    })
  }
}
