// src/auth/application/use-cases/login.use-case.ts
import { Inject, Injectable } from '@nestjs/common';

import { User } from '@user/domain/user'; // Import User type
import { IJwtService, JWT_SERVICE } from '../ports/jwt-service.interface';

// Interface simple pour la réponse du login
export interface LoginResponse {
  accessToken: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(JWT_SERVICE) // Inject the JWT Service implementation
    private readonly jwtService: IJwtService,
  ) {}

  /**
   * Generates a JWT access token for a validated user.
   * @param user The validated user object (typically without the password hash).
   * @returns An object containing the generated access token.
   */
  async execute(user: Omit<User, 'passwordHash'>): Promise<LoginResponse> {
    // Define the payload for the JWT. Include essential, non-sensitive info.
    // 'sub' (subject) is standard for user ID.
    const payload = {
      sub: user.id,
      email: user.email,
      // Add other claims if needed (e.g., roles, permissions - be careful with size/sensitivity)
      // roles: user.roles, // Example if roles were part of the User domain
    };

    // Sign the token using the injected service
    const accessToken = await this.jwtService.sign(payload);

    // Return the token in a structured response
    return {
      accessToken: accessToken,
    };
  }
}
