// src/shared/infrastructure/services/uuid.service.ts
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IIdGenerator } from '../../../user/application/ports/id-generator.interface'; // Ajustez le chemin si partagé différemment

@Injectable()
export class UuidService implements IIdGenerator {
  generate(): string {
    return uuidv4();
  }
}
