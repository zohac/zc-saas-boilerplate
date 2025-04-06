// src/user/application/ports/password-hasher.interface.ts
export interface IPasswordHasher {
  /**
   * Hashes a plain text password.
   * @param plainPassword The password to hash.
   * @returns A promise resolving to the hashed password string.
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compares a plain text password with a stored hash.
   * @param plainPassword The password entered by the user.
   * @param storedHash The hash stored in the database.
   * @returns A promise resolving to true if passwords match, false otherwise.
   */
  compare(plainPassword: string, storedHash: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');