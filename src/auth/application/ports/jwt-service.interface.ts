// src/auth/application/ports/jwt-service.interface.ts

// Définir une interface pour la structure minimale attendue du payload
// (Adapter selon ce que vous mettez réellement dedans)
export interface BaseJwtPayload {
  sub: string; // Subject (ID utilisateur)
  email?: string; // Email (optionnel si pas toujours inclus)
  iat?: number; // Issued at (standard JWT)
  exp?: number; // Expiration time (standard JWT)
  [key: string]: unknown; // Permet d'autres propriétés de type inconnu
}

/**
 * Defines the contract for JWT operations (signing, potentially verifying).
 * Acts as a Port in Clean Architecture, implemented by Infrastructure.
 */
export interface IJwtService {
  /**
   * Signs a payload to generate a JWT access token.
   * Le payload peut être n'importe quel objet, mais il devrait contenir au moins 'sub'.
   * @param payload The data to include in the token (should ideally conform partially to BaseJwtPayload).
   * @param expiresIn Optional expiration time (e.g., '60s', '1h', '7d'). Uses default if not provided.
   * @returns A promise resolving to the signed JWT string.
   */
  // Pour sign, Record<string, unknown> est souvent acceptable car on ne lit pas ses propriétés ici.
  // On pourrait aussi typer plus strictement le payload attendu en entrée si on veut.
  sign(payload: Record<string, unknown>, expiresIn?: string): Promise<string>;

  /**
   * Verifies a JWT token and returns its payload if valid.
   * Throws an error if the token is invalid or expired.
   * @param token The JWT string to verify.
   * @returns A promise resolving to the decoded payload, conforming to BaseJwtPayload.
   */
  // Utiliser l'interface de base pour le retour
  verify(token: string): Promise<BaseJwtPayload>;
}

// Injection Token
export const JWT_SERVICE = Symbol('JWT_SERVICE');
