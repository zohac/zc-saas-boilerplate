// src/user/application/use-cases/delete-user.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
  }

  /**
   * Executes the use case to soft-delete a user.
   * Marks the user as deleted and inactive.
   * @param id The ID of the user to soft-delete.
   * @returns A promise resolving when the operation is complete.
   * @throws NotFoundException if the user with the given ID is not found or already deleted.
   */
  async execute(id: string): Promise<void> {
    // 1. Find the existing user
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser || existingUser.deletedAt) { // Check if not found OR already deleted
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé ou déjà supprimé.`);
    }

    // 2. Mark as deleted and inactive
    existingUser.deletedAt = new Date();
    existingUser.isActive = false; // Good practice to deactivate on delete
    existingUser.updatedAt = new Date(); // Update timestamp

    // 3. Save the changes using the existing save method
    await this.userRepository.save(existingUser);

    // Note: We could also call userRepository.delete(id) if the interface
    // method was intended for hard delete, but using save for soft delete is common.
  }
}