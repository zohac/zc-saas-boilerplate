// src/auth/application/use-cases/validate-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';

import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@user/application/ports/password-hasher.interface'; // Import Hasher interface & token
import { User } from '@user/domain/user'; // Import User domain entity
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@user/domain/user.repository.interface'; // Import User repo interface & token

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) // Inject the hasher implementation provided by UserModule/Shared
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Validates user credentials.
   * Finds user by email and compares the provided password with the stored hash.
   * @param email The user's email.
   * @param pass The plain text password to validate.
   * @returns The User domain entity if validation succeeds, otherwise null.
   */
  async execute(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findByEmail(email);

    // Check if user exists and is active (and not soft-deleted)
    if (!user || !user.isActive || user.deletedAt) {
      return null;
    }

    // Compare the provided password with the stored hash
    const isPasswordMatching = await this.passwordHasher.compare(
      pass,
      user.passwordHash,
    );

    if (isPasswordMatching) {
      // Passwords match, return user data (excluding the hash for security)

      const { passwordHash: _passwordHash, ...result } = user; // Destructure to remove passwordHash
      return result;
    }

    // Passwords don't match
    return null;
  }
}
