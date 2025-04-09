// src/user/domain/user.ts

/**
 * Represents the core User entity in the domain layer.
 * Inspired by schema.org/Person properties relevant to a SaaS context.
 * This class should be persistence-agnostic.
 */
export class User {
  /**
   * Unique identifier for the user (e.g., UUID).
   * Maps to schema.org identifier.
   */
  id: string;

  /**
   * User's primary email address, used for login and communication.
   * Maps to schema.org email.
   */
  email: string;

  /**
   * Securely hashed representation of the user's password.
   * The hashing mechanism itself is an infrastructure concern.
   */
  passwordHash: string;

  /**
   * User's first name.
   * Maps to schema.org givenName.
   */
  givenName: string;

  /**
   * User's last name.
   * Maps to schema.org familyName.
   */
  familyName: string;

  /**
   * User's phone number (optional).
   * Maps to schema.org telephone.
   */
  telephone: string | null;

  /**
   * URL of the user's profile picture (optional).
   * Maps to schema.org image.
   */
  imageUrl: string | null;

  /**
   * Indicates if the user account is currently active.
   * Set to false for pending verification or suspensions.
   */
  isActive: boolean;

  /**
   * Timestamp when the user account was created.
   */
  createdAt: Date;

  /**
   * Timestamp when the user account was last updated.
   */
  updatedAt: Date;

  /**
   * Timestamp of the last successful login (optional).
   */
  lastLoginAt: Date | null;

  /**
   * Timestamp when the user account was soft-deleted (optional).
   * If null, the user is not deleted.
   */
  deletedAt: Date | null;

  // --- Constructor (Optional but good practice) ---
  // Allows creating instances easily, potentially setting defaults.
  // Note: ID might be generated later by infrastructure. Password hash too.
  constructor(props: Partial<User>) {
    Object.assign(this, props);
    // Ensure defaults if necessary (e.g., isActive might default to true or false)
    this.isActive ??= true;

    // Ensure dates are Date objects if created from plain objects
    if (props.createdAt && typeof props.createdAt === 'string') {
      this.createdAt = new Date(props.createdAt);
    }
    if (props.updatedAt && typeof props.updatedAt === 'string') {
      this.updatedAt = new Date(props.updatedAt);
    }
    if (props.lastLoginAt && typeof props.lastLoginAt === 'string') {
      this.lastLoginAt = new Date(props.lastLoginAt);
    }
    if (props.deletedAt && typeof props.deletedAt === 'string') {
      this.deletedAt = new Date(props.deletedAt);
    }
  }

  // --- Potential Domain Methods (Examples - Add if needed) ---

  /**
   * Gets the user's full name.
   */
  // get fullName(): string {
  //   return `${this.givenName} ${this.familyName}`.trim();
  // }

  /**
   * Marks the user as inactive.
   */
  // deactivate(): void {
  //   this.isActive = false;
  //   this.updatedAt = new Date();
  // }
}
