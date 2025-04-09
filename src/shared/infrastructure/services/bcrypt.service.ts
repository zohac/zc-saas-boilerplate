// src/shared/infrastructure/services/bcrypt.service.ts
import { Injectable } from '@nestjs/common';

import { IPasswordHasher } from '@user/application/ports/password-hasher.interface'; // Ajustez le chemin si besoin
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService implements IPasswordHasher {
  private readonly saltRounds = 10; // Ou configurable via ConfigService

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, storedHash);
  }
}
