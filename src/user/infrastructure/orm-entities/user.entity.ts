// src/user/infrastructure/orm-entities/user.entity.ts
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn, } from 'typeorm';

@Entity('users') // Nom de la table dans la base de données
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 255, unique: true})
  @Index() // Index sur l'email pour des recherches rapides
  email: string;

  @Column({name: 'password_hash', type: 'varchar', length: 255})
  passwordHash: string;

  @Column({name: 'given_name', type: 'varchar', length: 100})
  givenName: string;

  @Column({name: 'family_name', type: 'varchar', length: 100})
  familyName: string;

  @Column({type: 'varchar', length: 50, nullable: true})
  telephone: string | null;

  @Column({name: 'image_url', type: 'text', nullable: true})
  imageUrl: string | null;

  @Column({name: 'is_active', type: 'boolean', default: true})
  isActive: boolean;

  @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at', type: 'timestamp with time zone'})
  updatedAt: Date;

  @Column({name: 'last_login_at', type: 'timestamp with time zone', nullable: true})
  lastLoginAt: Date | null;

  @DeleteDateColumn({name: 'deleted_at', type: 'timestamp with time zone', nullable: true})
  @Index() // Utile pour exclure les enregistrements soft-deleted des requêtes
  deletedAt: Date | null;
}