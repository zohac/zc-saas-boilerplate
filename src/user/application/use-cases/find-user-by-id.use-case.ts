// src/user/application/use-cases/find-user-by-id.use-case.ts
import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/user';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the use case to find a user by their unique ID.
   * @param id The unique ID of the user to find.
   * @returns The User entity or null if not found.
   */
  async execute(id: string): Promise<User | null> {
    // We might want to exclude soft-deleted users by default in the repository implementation later
    return this.userRepository.findById(id);
  }
}
