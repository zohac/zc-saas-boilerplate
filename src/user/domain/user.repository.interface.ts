// src/user/domain/user.repository.interface.ts

import { User } from './user';

/**
 * Interface defining the contract for user data persistence.
 * This acts as a port in Clean Architecture, implemented by the Infrastructure layer.
 */
export interface IUserRepository {
  /**
   * Saves a user entity (creates if new, updates if exists based on ID).
   * @param user The user entity to save.
   * @returns A promise resolving to the saved user entity (potentially with updated fields like ID or timestamps).
   */
  save(user: User): Promise<User>;

  /**
   * Finds a user by their unique identifier.
   * @param id The unique ID of the user.
   * @returns A promise resolving to the User entity or null if not found.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * @param email The email address to search for.
   * @param includeDeleted
   * @returns A promise resolving to the User entity or null if not found.
   */
  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;

  /**
   * Deletes a user by their unique identifier.
   * The implementation might perform a hard or soft delete.
   * @param id The unique ID of the user to delete.
   * @returns A promise resolving when the deletion is complete.
   */
  delete(id: string): Promise<void>;

  // Add other necessary methods here later, e.g., for searching, pagination...
  // find(criteria: any): Promise<User[]>;
}

// It's common practice to also define an injection token for the interface
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');