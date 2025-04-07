// src/auth/application/ports/jwt-service.interface.ts

/**
 * Defines the contract for JWT operations (signing, potentially verifying).
 * Acts as a Port in Clean Architecture, implemented by Infrastructure.
 */
export interface IJwtService {
  /**
   * Signs a payload to generate a JWT access token.
   * @param payload The data to include in the token (e.g., { sub: userId, email: userEmail }).
   * @param expiresIn Optional expiration time (e.g., '60s', '1h', '7d'). Uses default if not provided.
   * @returns A promise resolving to the signed JWT string.
   */
  sign(payload: Record<string, any>, expiresIn?: string): Promise<string>;

  /**
   * Verifies a JWT token and returns its payload if valid.
   * Throws an error if the token is invalid or expired.
   * @param token The JWT string to verify.
   * @returns A promise resolving to the decoded payload.
   */
  verify(token: string): Promise<Record<string, any>>;
}

// Injection Token
export const JWT_SERVICE = Symbol('JWT_SERVICE');
