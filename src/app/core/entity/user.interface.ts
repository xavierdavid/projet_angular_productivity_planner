// Contrat de données de l'entité métier User déjà authentifiée (sans password)
export interface User {
  id: string;
  name: string;
  email: string;
}

// Contrat de données de l'entité métier User non encore authentifiée ('Visitor' qui n'a pas encore d'identifiant mais qui a un password)
export type Visitor = Omit<User, 'id'> & {password: string};