// src/user/infrastructure/mappers/user.mapper.ts
import { User } from '../../domain/user';
import { UserEntity } from '../orm-entities/user.entity';

export class UserMapper {
  /**
   * Converts a domain User entity to a persistence (ORM) UserEntity.
   */
  static toPersistence(domainUser: User): UserEntity {
    const persistenceUser = new UserEntity();
    persistenceUser.id = domainUser.id;
    persistenceUser.email = domainUser.email;
    persistenceUser.passwordHash = domainUser.passwordHash; // Assume already hashed
    persistenceUser.givenName = domainUser.givenName;
    persistenceUser.familyName = domainUser.familyName;
    persistenceUser.telephone = domainUser.telephone;
    persistenceUser.imageUrl = domainUser.imageUrl;
    persistenceUser.isActive = domainUser.isActive;
    persistenceUser.createdAt = domainUser.createdAt;
    persistenceUser.updatedAt = domainUser.updatedAt;
    persistenceUser.lastLoginAt = domainUser.lastLoginAt;
    persistenceUser.deletedAt = domainUser.deletedAt;
    return persistenceUser;
  }

  /**
   * Converts a persistence (ORM) UserEntity to a domain User entity.
   */
  static toDomain(persistenceUser: UserEntity): User {
    // Note: The constructor might handle date parsing if needed, but mapping ensures type safety
    return new User({
      id: persistenceUser.id,
      email: persistenceUser.email,
      passwordHash: persistenceUser.passwordHash,
      givenName: persistenceUser.givenName,
      familyName: persistenceUser.familyName,
      telephone: persistenceUser.telephone,
      imageUrl: persistenceUser.imageUrl,
      isActive: persistenceUser.isActive,
      createdAt: persistenceUser.createdAt,
      updatedAt: persistenceUser.updatedAt,
      lastLoginAt: persistenceUser.lastLoginAt,
      deletedAt: persistenceUser.deletedAt,
    });
  }
}