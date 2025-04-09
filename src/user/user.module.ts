// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BcryptService } from '@shared/infrastructure/services/bcrypt.service'; // Service partagé
import { UuidService } from '@shared/infrastructure/services/uuid.service'; // Service partagé
import { ID_GENERATOR } from './application/ports/id-generator.interface';
import { PASSWORD_HASHER } from './application/ports/password-hasher.interface';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { USER_REPOSITORY } from './domain/user.repository.interface';
import { UserEntity } from './infrastructure/orm-entities/user.entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [
    // 1. Importer TypeOrmModule.forFeature pour enregistrer UserEntity
    // Cela rend Repository<UserEntity> injectable dans ce module.
    TypeOrmModule.forFeature([UserEntity]),
    // Si d'autres modules sont importés ici (ex: un SharedModule), ajoutez-les.
  ],
  controllers: [
    // 2. Déclarer le contrôleur de ce module.
    UserController,
  ],
  providers: [
    // 3. Déclarer tous les Use Cases comme providers.
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // 4. Lier l'interface IUserRepository à son implémentation concrète.
    {
      provide: USER_REPOSITORY, // Token d'injection
      useClass: UserRepository, // Classe d'implémentation
    },
    // L'implémentation elle-même doit aussi être un provider connu
    UserRepository,

    // 5. Lier l'interface IPasswordHasher à son implémentation concrète.
    {
      provide: PASSWORD_HASHER, // Token d'injection
      useClass: BcryptService, // Classe d'implémentation (service partagé)
    },
    // L'implémentation elle-même doit aussi être un provider connu
    BcryptService,

    // 6. Lier l'interface IIdGenerator à son implémentation concrète.
    {
      provide: ID_GENERATOR, // Token d'injection
      useClass: UuidService, // Classe d'implémentation (service partagé)
    },
    // L'implémentation elle-même doit aussi être un provider connu
    UuidService,

    // Ajoutez d'autres providers spécifiques à ce module si nécessaire.
  ],
  exports: [
    // 7. Exporter les Use Cases ou services que d'autres modules pourraient vouloir utiliser.
    // L'AuthModule aura probablement besoin de FindUserByEmailUseCase et potentiellement d'autres.
    // Il est souvent préférable d'exporter les Use Cases plutôt que le Repository directement.
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    // Exporter la liaison pour le hasher pourrait être utile pour AuthModule
    // { provide: PASSWORD_HASHER, useClass: BcryptService }, // Ou juste le token? Exportons la liaison.
    // Alternative : Ne pas exporter le hasher ici, AuthModule importera/fournira sa propre liaison si SharedModule non utilisé.
    // -> Pour l'instant, exportons les Use Cases. L'AuthModule utilisera FindUserByEmailUseCase.
    // -> L'AuthModule aura aussi besoin de IPasswordHasher. Exportons la liaison.
    PASSWORD_HASHER, // Exporter juste le token suffit si BcryptService est un provider global ou dans un SharedModule exporté
    // -> Pour être sûr, exportons la liaison complète pour que ce module la fournisse.
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptService,
    },
    // Potentiellement utile si Auth doit vérifier un email
    // USER_REPOSITORY, // Ou juste le token
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})
export class UserModule {}
