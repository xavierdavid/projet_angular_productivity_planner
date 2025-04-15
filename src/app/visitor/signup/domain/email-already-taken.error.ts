// Gestion de l'erreur 'Email déjà existant' et du message correspondant
export class EmailAlreadyTakenError extends Error {
  constructor(readonly email: string) {
    super(`Email ${email} is already taken. Please try another email.`);
    this.name = 'EmailAlreadyTakenError';
  }
}