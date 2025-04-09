// src/user/application/use-cases/find-user-by-email.use-case.ts
import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/user';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user.repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
