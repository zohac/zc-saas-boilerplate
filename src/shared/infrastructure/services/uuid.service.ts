// src/shared/infrastructure/services/uuid.service.ts
import { Injectable } from '@nestjs/common';

import { IIdGenerator } from '@user/application/ports/id-generator.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UuidService implements IIdGenerator {
  generate(): string {
    return uuidv4();
  }
}
