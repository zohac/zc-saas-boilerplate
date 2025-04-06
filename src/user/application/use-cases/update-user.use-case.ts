// src/user/application/use-cases/update-user.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/user';
import { IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
  }

  /**
   * Executes the use case to update a user's profile information.
   * @param id The ID of the user to update.
   * @param updateUserDto The data transfer object containing updates.
   * @returns The updated User entity.
   * @throws NotFoundException if the user with the given ID is not found.
   */
  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // 1. Find the existing user
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser || existingUser.deletedAt) { // Also check if soft-deleted
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    // 2. Update allowed properties
    // Use optional chaining or checks to apply updates only if provided in the DTO
    if (updateUserDto.givenName !== undefined) {
      existingUser.givenName = updateUserDto.givenName;
    }
    if (updateUserDto.familyName !== undefined) {
      existingUser.familyName = updateUserDto.familyName;
    }
    if (updateUserDto.telephone !== undefined) {
      // Allow setting to null if explicitly provided as null in DTO
      existingUser.telephone = updateUserDto.telephone;
    }
    if (updateUserDto.imageUrl !== undefined) {
      existingUser.imageUrl = updateUserDto.imageUrl;
    }

    // 3. Update timestamp
    existingUser.updatedAt = new Date();

    // 4. Save the updated user
    const updatedUser = await this.userRepository.save(existingUser);

    return updatedUser;
  }
}