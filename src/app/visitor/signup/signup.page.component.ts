import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../core/authentication.service';

@Component({
  imports: [FormsModule],
  templateUrl: './signup.page.component.html',
  styleUrl: './signup.page.component.scss',
})
export class SignupPageComponent {
  readonly authenticationService = inject(AuthenticationService);
  
  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  readonly isPasswordMatchValid = computed(
    () => this.password === this.confirmPassword
  );

  onSubmit() {
    console.log('Form submitted');
    this.authenticationService.register(this.email(), this.password()).subscribe((response)=> {
      console.log('User registered with id : ',response.userId);
    });
  }
}
