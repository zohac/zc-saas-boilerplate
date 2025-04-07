// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule/Service for JwtModule config
import { JwtModule } from '@nestjs/jwt'; // Import NestJS JWT Module
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module'; // Import UserModule to access its exports

// Application Port & Infrastructure Implementation
import { JWT_SERVICE } from './application/ports/jwt-service.interface';
import { JwtStrategy } from './application/strategies/jwt.strategy';
// Application Components
import { LocalStrategy } from './application/strategies/local.strategy';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ValidateUserUseCase } from './application/use-cases/validate-user.use-case';
import { JwtService } from './infrastructure/services/jwt.service'; // Our concrete implementation
// Presentation Components
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    // 1. Import UserModule: Makes exports from UserModule available here.
    //    We need access to IUserRepository and IPasswordHasher bindings/providers.
    UserModule,

    // 2. Import PassportModule: Configures Passport basics.
    PassportModule.register({defaultStrategy: 'jwt'}), // Optional: set default strategy

    // 3. Configure JwtModule Asynchronously:
    //    Crucial for using @nestjs/jwt service and configuring it with .env variables.
    JwtModule.registerAsync({
      imports: [ConfigModule], // Make ConfigService available in the factory
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME');
        if (!secret) {
          // Already checked in JwtService/JwtStrategy, but double check is fine
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          secret: secret,
          signOptions: {expiresIn: expiresIn || '3600s'}, // Default expiration if not set
        };
      },
      inject: [ConfigService], // Inject ConfigService into the factory
    }),
    // ConfigModule is likely already global, but importing here ensures availability for JwtModule factory
    ConfigModule,
  ],
  controllers: [
    // 4. Declare AuthController.
    AuthController,
  ],
  providers: [
    // 5. Register Use Cases.
    ValidateUserUseCase,
    LoginUseCase,

    // 6. Register Passport Strategies.
    LocalStrategy,
    JwtStrategy,

    // 7. Provide the concrete implementation for the IJwtService port.
    {
      provide: JWT_SERVICE, // The injection token
      useClass: JwtService, // The concrete infrastructure service
    },
    // The concrete JwtService itself needs to be a provider so Nest can instantiate it
    // and inject its dependencies (@nestjs/jwt's JwtService, ConfigService).
    JwtService,

    // Guards are typically not listed in providers unless they have complex dependencies
    // that need to be resolved by the DI container beyond simple instantiation.
    // LocalAuthGuard and JwtAuthGuard are simple enough not to need listing here.

    // Note: We don't need to provide UserRepository or BcryptService here again,
    // because UserModule provides and exports them, and we imported UserModule.
  ],
  exports: [
    // 8. Export services if other modules need to directly interact with Auth logic
    // (Often not necessary for AuthModule itself, security is handled by guards).
    // PassportModule and JwtModule might be exported if creating a shared Auth setup.
    PassportModule,
    JwtModule, // Exporting JwtModule allows injection of @nestjs/jwt's JwtService elsewhere if needed
  ],
})
export class AuthModule {
}
