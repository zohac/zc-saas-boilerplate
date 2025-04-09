// src/user/application/ports/id-generator.interface.ts
export interface IIdGenerator {
  /**
   * Generates a unique identifier string.
   * @returns A unique ID (e.g., a UUID).
   */
  generate(): string;
}

export const ID_GENERATOR = Symbol('ID_GENERATOR');
