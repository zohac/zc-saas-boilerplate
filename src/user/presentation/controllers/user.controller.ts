// src/user/presentation/controllers/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserDto } from '../../application/dto/user.dto'; // DTO de sortie
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { User } from '../../domain/user'; // Import de l'entité domaine pour le mapping

@Controller('users') // Définit le préfixe de route pour ce contrôleur
export class UserController {
  constructor(
    // Injection des Use Cases de la couche Application
    @Inject(CreateUserUseCase) // Utiliser Inject si non enregistré comme provider direct plus tard
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(FindUserByIdUseCase)
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    @Inject(UpdateUserUseCase)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(DeleteUserUseCase)
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {
  }

  // --- Endpoint POST pour créer un utilisateur ---
  @Post()
  @HttpCode(HttpStatus.CREATED) // Statut 201 pour la création réussie
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    // Le ValidationPipe global (configuré dans main.ts) valide automatiquement createUserDto
    const newUserDomain = await this.createUserUseCase.execute(createUserDto);
    // Mapper l'entité domaine vers le DTO de sortie pour ne pas exposer le hash, etc.
    return this.mapToDto(newUserDomain);
  }

  // --- Endpoint GET pour récupérer un utilisateur par ID ---
  @Get(':id')
  async findUserById(
    @Param('id', ParseUUIDPipe) id: string, // Valide que l'ID est un UUID
  ): Promise<UserDto> {
    const userDomain = await this.findUserByIdUseCase.execute(id);
    if (!userDomain) {
      // Bien que le repo puisse déjà le faire, une double vérification ou
      // une gestion différente ici est possible.
      // Le Use Case devrait idéalement déjà lever NotFoundException.
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }
    return this.mapToDto(userDomain);
  }

  // --- Endpoint PATCH pour mettre à jour un utilisateur ---
  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto, // Le ValidationPipe global valide aussi ce DTO
  ): Promise<UserDto> {
    const updatedUserDomain = await this.updateUserUseCase.execute(id, updateUserDto);
    // Le Use Case gère la NotFoundException si l'ID n'existe pas
    return this.mapToDto(updatedUserDomain);
  }

  // --- Endpoint DELETE pour supprimer (soft delete) un utilisateur ---
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Statut 204 pour une suppression réussie sans contenu retourné
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
    // Le Use Case gère la NotFoundException si l'ID n'existe pas ou est déjà supprimé
  }

  // --- Helper privé pour mapper l'entité Domaine vers le DTO de sortie ---
  private mapToDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.givenName = user.givenName;
    dto.familyName = user.familyName;
    dto.telephone = user.telephone;
    dto.imageUrl = user.imageUrl;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    dto.lastLoginAt = user.lastLoginAt;
    // IMPORTANT: Ne pas inclure user.passwordHash ou user.deletedAt dans le DTO de sortie standard
    return dto;
  }
}