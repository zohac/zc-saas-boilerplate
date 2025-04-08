// src/user/infrastructure/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user';
import { IUserRepository } from '../../domain/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserEntity } from '../orm-entities/user.entity';

@Injectable() // Rendre la classe injectable
export class UserRepository implements IUserRepository {
  constructor(
    // Injecter le Repository TypeORM pour l'entité UserEntity
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {
  }

  async save(user: User): Promise<User> {
    // Mapper l'entité domaine vers l'entité ORM
    const ormEntity = UserMapper.toPersistence(user);
    // Sauvegarder via TypeORM
    const savedOrmEntity = await this.ormRepository.save(ormEntity);
    // Remapper l'entité sauvegardée (peut contenir des champs mis à jour par la BDD) vers le domaine
    return UserMapper.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {id: id, deletedAt: undefined}, // Exclut les soft-deleted par défaut
    });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string, includeDeleted = false): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {email},
      withDeleted: includeDeleted,
    });

    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  async delete(id: string): Promise<void> {
    // Implémente une suppression HARD delete, bien que notre UseCase utilise save() pour le soft delete.
    // Cette méthode pourrait être utilisée par un admin ou un processus de nettoyage.
    await this.ormRepository.delete({id});
    // Si on voulait aligner cette méthode sur le soft delete, on ferait:
    // const user = await this.findById(id);
    // if (user) {
    //   user.deletedAt = new Date();
    //   user.isActive = false;
    //   await this.save(user);
    // }
  }

  // Implémentation future potentielle:
  // async find(criteria: Partial<User>): Promise<User[]> {
  //   const whereClause: FindOptionsWhere<UserEntity> = {};
  //   if (criteria.email) whereClause.email = criteria.email;
  //   if (criteria.isActive !== undefined) whereClause.isActive = criteria.isActive;
  //   // ... mapper d'autres critères
  //   whereClause.deletedAt = undefined; // Toujours exclure les supprimés par défaut
}