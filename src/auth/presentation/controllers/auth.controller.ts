// src/auth/presentation/controllers/auth.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserDto } from '@user/application/dto/user.dto'; // Import UserDto for response
import { User } from '@user/domain/user'; // Import User domain type
import { Request } from 'express'; // Import Request type from express
import { LoginDto } from '../../application/dto/login.dto'; // Import LoginDto for type safety although not directly used in @Body here
import { LoginResponse, LoginUseCase } from '../../application/use-cases/login.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

// Define an interface extending Express Request to include the user property populated by Passport
interface RequestWithUser extends Request {
  user: Omit<User, 'passwordHash'>; // User object attached by LocalStrategy or JwtStrategy
}

@ApiTags('Auth')
@Controller('auth') // Base path for auth routes
export class AuthController {
  constructor(
    // Inject the LoginUseCase
    // No need for @Inject() if LoginUseCase is registered as a standard provider in AuthModule
    private readonly loginUseCase: LoginUseCase,
  ) {
  }

  /**
   * Handles user login requests.
   * Uses LocalAuthGuard to trigger LocalStrategy for validating credentials.
   * If validation succeeds, LocalStrategy attaches the user object to req.user.
   * This endpoint then uses LoginUseCase to generate and return a JWT.
   * @param req The Express request object, augmented with the user property by Passport.
   * @param _loginDto Included for Swagger/OpenAPI documentation, validation handled by LocalStrategy/Guard
   */
  @Post('login')
  @UseGuards(LocalAuthGuard) // Apply the Local Authentication Guard
  @HttpCode(HttpStatus.OK)   // Return 200 OK on successful login
  @ApiOperation({summary: 'Log in user and get access token'})
  @ApiBody({type: LoginDto}) // Décrit le corps attendu
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {properties: {accessToken: {type: 'string', example: 'eyJ...'}}}
  }) // Décrit la réponse
  @ApiResponse({status: 401, description: 'Invalid credentials.'}) // Erreur d'auth
  async login(@Req() req: RequestWithUser, @Body() _loginDto: LoginDto): Promise<LoginResponse> {
    // If LocalAuthGuard passes, req.user contains the validated user object (without hash)
    // Pass this user object to the LoginUseCase to get the JWT
    console.log('Login endpoint hit, user validated:', req.user.email); // Debug log
    return this.loginUseCase.execute(req.user);
  }

  /**
   * Protected route example: Get the profile of the currently logged-in user.
   * Uses JwtAuthGuard to trigger JwtStrategy for validating the JWT in the Authorization header.
   * If validation succeeds, JwtStrategy attaches the user object (or payload) to req.user.
   * @param req The Express request object, augmented with the user property by Passport.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard) // Apply the JWT Authentication Guard
  @ApiBearerAuth('access-token') // <-- Indique que cette route nécessite le token Bearer
  @ApiOperation({summary: 'Get current logged-in user profile'})
  @ApiResponse({status: 200, description: 'User profile retrieved successfully.', type: UserDto}) // Utilise UserDto pour la structure
  @ApiResponse({status: 401, description: 'Unauthorized (Invalid or missing token).'})
  getProfile(@Req() req: RequestWithUser): UserDto { // Return UserDto
    // If JwtAuthGuard passes, req.user contains the user object (or payload) returned by JwtStrategy's validate method
    console.log('Profile endpoint hit for user:', req.user.email); // Debug log
    // Map the user object from the request to a safe DTO
    return this.mapUserToDto(req.user);
  }

  // Helper to map User domain object to UserDto
  private mapUserToDto(user: Omit<User, 'passwordHash'>): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.givenName = user.givenName;
    dto.familyName = user.familyName;
    dto.telephone = user.telephone;
    dto.imageUrl = user.imageUrl;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    dto.lastLoginAt = user.lastLoginAt;
    return dto;
  }
}
