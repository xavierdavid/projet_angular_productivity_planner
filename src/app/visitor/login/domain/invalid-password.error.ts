// Gestion de l'erreur 'Mot de passe invalide' et du message correspondant
export class InvalidPasswordError extends Error {
  constructor(readonly password: string) {
    super(`Invalid password. Please try another password.`);
    this.name = 'InvalidPasswordError';
  }
}