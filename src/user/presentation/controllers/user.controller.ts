// src/user/presentation/controllers/user.controller.ts
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserDto } from '../../application/dto/user.dto'; // DTO de sortie
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { User } from '../../domain/user'; // Import de l'entité domaine pour le mapping

@ApiTags('Users')
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
  ) {}

  // --- Endpoint POST pour créer un utilisateur ---
  @Post()
  @HttpCode(HttpStatus.CREATED) // Statut 201 pour la création réussie
  @ApiOperation({ summary: 'Create a new user' }) // Description de l'opération
  @ApiBody({ type: CreateUserDto }) // Décrit le corps attendu
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserDto,
  }) // Réponse succès
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed).',
  }) // Erreur validation
  @ApiResponse({ status: 409, description: 'Email already exists.' }) // Erreur conflit
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    // Le ValidationPipe global (configuré dans main.ts) valide automatiquement createUserDto
    const newUserDomain = await this.createUserUseCase.execute(createUserDto);
    // Mapper l'entité domaine vers le DTO de sortie pour ne pas exposer le hash, etc.
    return this.mapToDto(newUserDomain);
  }

  // --- Endpoint GET pour récupérer un utilisateur par ID ---
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token') // Indique que cette route nécessite le Bearer Token configuré
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  }) // Décrit le paramètre d'URL
  @ApiResponse({ status: 200, description: 'User found.', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (Invalid or missing token).',
  }) // Erreur d'auth
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
  @UseGuards(JwtAuthGuard) // Protéger
  @ApiBearerAuth('access-token') // Nécessite token
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or UUID format.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto, // Le ValidationPipe global valide aussi ce DTO
  ): Promise<UserDto> {
    const updatedUserDomain = await this.updateUserUseCase.execute(
      id,
      updateUserDto,
    );
    // Le Use Case gère la NotFoundException si l'ID n'existe pas
    return this.mapToDto(updatedUserDomain);
  }

  // --- Endpoint DELETE pour supprimer (soft delete) un utilisateur ---
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Statut 204 pour une suppression réussie sans contenu retourné
  @UseGuards(JwtAuthGuard) // Protéger
  @ApiBearerAuth('access-token') // Nécessite token
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({
    status: 404,
    description: 'User not found or already deleted.',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
