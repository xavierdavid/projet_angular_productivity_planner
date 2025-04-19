// Gestion de l'erreur 'Identifiants invalides' et du message correspondant
export class InvalidCredentialError extends Error {
  constructor() {
    super(`Invalid credentials. Please check your email and password.`);
    this.name = 'InvalidCredentialError';
  }
}