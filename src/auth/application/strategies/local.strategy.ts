// src/auth/application/strategies/local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { User } from '@user/domain/user'; // Import User type
import { Strategy } from 'passport-local';
import { ValidateUserUseCase } from '../use-cases/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  // Le 2e arg 'local' est le nom par défaut, mais on peut l'expliciter
  constructor(
    // Injecter directement le Use Case
    // Pas besoin de @Inject() ici si ValidateUserUseCase est enregistré comme provider standard dans AuthModule
    private readonly validateUserUseCase: ValidateUserUseCase,
  ) {
    // Configuration de la stratégie Local.
    // Par défaut, passport-local s'attend à des champs 'username' et 'password'.
    // On remappe ici pour utiliser 'email' comme champ "username".
    super({
      usernameField: 'email', // Indique à Passport d'utiliser le champ 'email' du body
      // passwordField: 'password' // C'est la valeur par défaut, pas besoin de le spécifier
    });
  }

  /**
   * Méthode appelée automatiquement par Passport lorsque la stratégie 'local' est utilisée (via LocalAuthGuard).
   * Elle reçoit les credentials extraits de la requête (email, password ici grâce à usernameField).
   * @param email L'email fourni par le client.
   * @param password Le mot de passe fourni par le client.
   * @returns L'objet utilisateur validé (sans le hash) si l'authentification réussit.
   * @throws UnauthorizedException si l'authentification échoue.
   */
  async validate(
    email: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    console.log(`LocalStrategy validating user: ${email}`); // Log de débogage
    const user = await this.validateUserUseCase.execute(email, password);

    if (!user) {
      console.log(`LocalStrategy validation failed for user: ${email}`); // Log de débogage
      // Si le Use Case retourne null, l'utilisateur n'est pas valide.
      throw new UnauthorizedException('Identifiants invalides.');
    }
    console.log(`LocalStrategy validation successful for user: ${email}`); // Log de débogage
    // Si le Use Case retourne l'utilisateur, l'authentification réussit.
    // Passport attache cet objet utilisateur à request.user.
    return user;
  }
}
