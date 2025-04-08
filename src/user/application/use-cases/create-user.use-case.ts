// src/user/application/use-cases/create-user.use-case.ts
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { ID_GENERATOR, IIdGenerator } from '../ports/id-generator.interface'; // <-- Importer Port + Token
import { IPasswordHasher, PASSWORD_HASHER } from '../ports/password-hasher.interface'; // <-- Importer Port + Token

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) // <-- Injecter via Token
    private readonly passwordHasher: IPasswordHasher,
    @Inject(ID_GENERATOR) // <-- Injecter via Token
    private readonly idGenerator: IIdGenerator,
  ) {
  }

  async execute(createUserDto: CreateUserDto): Promise<User> {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(createUserDto.email, true);
    if (existingUser) {
      throw new ConflictException(`Un utilisateur avec l'email ${createUserDto.email} existe déjà.`);
    }

    // 2. Hacher le mot de passe via le service abstrait
    const hashedPassword = await this.passwordHasher.hash(createUserDto.password);

    // 3. Générer l'ID via le service abstrait
    const userId = this.idGenerator.generate();

    // 4. Créer une instance de l'entité domaine User
    const newUser = new User({
      id: userId, // <-- Utiliser l'ID généré
      email: createUserDto.email,
      passwordHash: hashedPassword, // <-- Utiliser le hash généré
      givenName: createUserDto.givenName,
      familyName: createUserDto.familyName,
      telephone: createUserDto.telephone ?? null,
      imageUrl: createUserDto.imageUrl ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      deletedAt: null,
    });

    // 5. Sauvegarder via le repository
    const savedUser = await this.userRepository.save(newUser);

    // 6. Retourner l'utilisateur sauvegardé
    return savedUser;
  }
}