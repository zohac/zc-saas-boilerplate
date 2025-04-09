// src/auth/application/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Pour récupérer le secret JWT
import { PassportStrategy } from '@nestjs/passport';

import { FindUserByIdUseCase } from '@user/application/use-cases/find-user-by-id.use-case'; // Pour vérifier si l'utilisateur existe toujours
import { User } from '@user/domain/user';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Interface décrivant le payload attendu dans notre JWT
export interface JwtPayload {
  sub: string; // Subject (conventionnellement l'ID utilisateur)
  email: string;
  // Ajoutez d'autres champs si vous les avez inclus lors de la signature
  // iat?: number; // Issued at (ajouté automatiquement par @nestjs/jwt)
  // exp?: number; // Expiration time (ajouté automatiquement par @nestjs/jwt)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // Le 2e arg 'jwt' est le nom par défaut
  constructor(
    private readonly configService: ConfigService, // Injecter ConfigService pour le secret
    // Injecter le UseCase pour vérifier si l'utilisateur existe toujours en BDD
    // Pas besoin de @Inject() si FindUserByIdUseCase est exporté par UserModule et importé par AuthModule
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // Vérification explicite au démarrage
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is not defined. Application cannot start.',
      );
    }

    super({
      // Méthode pour extraire le JWT de la requête.
      // Ici, on extrait depuis l'en-tête 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Important : Ne pas ignorer l'expiration du token !
      ignoreExpiration: false,

      // Clé secrète utilisée pour vérifier la signature du token.
      // Elle DOIT être la même que celle utilisée pour signer le token.
      secretOrKey: jwtSecret,

      // Vous pouvez aussi utiliser secretOrKeyProvider pour une logique plus complexe
      // (ex: clés publiques multiples, JWKS)
    });
  }

  /**
   * Méthode appelée par Passport après avoir vérifié la signature et l'expiration du JWT.
   * Elle reçoit le payload décodé du JWT.
   * @param payload Le payload décodé du JWT (conforme à JwtPayload).
   * @returns L'objet utilisateur (ou une partie) qui sera attaché à request.user.
   * @throws UnauthorizedException si l'utilisateur n'est plus valide.
   */
  async validate(
    payload: JwtPayload,
  ): Promise<Omit<User, 'passwordHash' | 'deletedAt'>> {
    // Retourne any ici, mais souvent on retourne un objet utilisateur simplifié
    console.log(`JwtStrategy validating payload for user ID: ${payload.sub}`); // Log de débogage
    // Ici, nous pourrions juste retourner le payload tel quel si nous faisons confiance
    // au contenu du token une fois sa signature validée.
    // return { userId: payload.sub, email: payload.email };

    // OU (plus sûr) : Vérifier que l'utilisateur existe toujours dans la base de données.
    // Cela évite qu'un token valide soit utilisé si l'utilisateur a été supprimé/désactivé depuis.
    const user = await this.findUserByIdUseCase.execute(payload.sub);

    if (!user?.isActive) {
      console.log(
        `JwtStrategy validation failed: User ${payload.sub} not found or inactive.`,
      ); // Log de débogage
      throw new UnauthorizedException(
        'Utilisateur associé au token invalide ou inactif.',
      );
    }
    console.log(
      `JwtStrategy validation successful for user ID: ${payload.sub}`,
    ); // Log de débogage

    // Retourner les informations utilisateur nécessaires pour les requêtes suivantes.
    // Éviter de retourner des informations sensibles comme le hash du mot de passe.
    const {
      passwordHash: _passwordHash,

      deletedAt: _deletedAt,
      ...secureUser
    } = user;
    return secureUser; // Attache cet objet à request.user
  }
}
