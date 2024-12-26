import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationService } from './core/authentication.service';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'productivity-planner';

  // Gestion du bouton déclenchant l'authentification d'un utilisateur inscrit
  private readonly authenticationService = inject(AuthenticationService)

  onLogin() {
    const email = 'john.doe@gmail.com';
    const password = 'azerty';
    this.authenticationService
    .login(email, password)
    // Gestion des observables en chaîne retournés par le service d'authentification
    .pipe(switchMap((response) => {
      console.log(response);
      // Destructuration des propriétés de la réponse dont nous avons besoin
      const {email, localId, idToken} = response;
      return this.authenticationService.save(email, localId, idToken);
    }))
    // Abonnement à l'observable de sauvegarde du service d'authentification
    .subscribe((response) => console.log(response));
  }
}
