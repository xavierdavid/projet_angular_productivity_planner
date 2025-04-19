import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/port/authentication.service';
import { UserService } from '@app/core/port/user.service';
import { UserStore } from '@app/core/store/user.store';
import { firstValueFrom } from 'rxjs';
import { InvalidCredentialError } from './invalid-credential.error';

@Injectable({
  providedIn: 'root'
})
export class LoginUserUseCase {
  readonly #authenticationService = inject(AuthenticationService);
  readonly #userService = inject(UserService);
  readonly #userStore = inject(UserStore);
  readonly #router = inject(Router);

  async execute(email: string, password: string): Promise<void> {
    // 1. Authenticate existing user
    const response = await firstValueFrom(this.#authenticationService.login(email, password));

    // 2. Throw an errof if credentials are invalid
    if(response instanceof InvalidCredentialError) {
      throw response;
    }

    // 3. Add credentials information in webapp storage
    const { jwtToken, jwtRefreshToken, expiresIn, userId } = response;

    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('jwtRefreshToken', jwtRefreshToken);
    localStorage.setItem('expiresIn', expiresIn);

    // 4. Add user in app store
    const user = await firstValueFrom(this.#userService.fetch(userId, jwtToken));
    this.#userStore.load(user);

    // 5. Redirect user to dashboard
    this.#router.navigate(['/app/dashboard']);
  }
}
