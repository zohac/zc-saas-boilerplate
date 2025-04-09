// test/app.e2e-spec.ts

import { AppModule } from '@/app.module';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from '@shared/common/filters/all-exceptions.filter';
import * as http from 'node:http';
import * as request from 'supertest';

describe('App Root (e2e)', () => {
  // Renommer le describe
  let app: INestApplication;
  let httpServer: http.Server;

  beforeAll(async () => {
    // Utiliser beforeAll pour ne créer l'app qu'une fois
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // --- IMPORTANT: Appliquer les configurations globales aussi aux tests E2E ---
    // C'est essentiel pour que les tests E2E reflètent le comportement réel
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.setGlobalPrefix('api'); // Ne pas oublier le préfixe global
    // Vous pourriez aussi vouloir appeler app.enableCors() et app.use(helmet()) si pertinent pour le test E2E

    await app.init();
    httpServer = app.getHttpServer() as http.Server; // Stocker le serveur HTTP
  });

  afterAll(async () => {
    await app.close(); // Fermer l'application après tous les tests
  });

  it('/api (GET - Should be 404 Not Found)', () => {
    // Tester la racine préfixée
    return request(httpServer) // Utiliser la variable stockée
      .get('/api') // Tester la racine vide *après* le préfixe
      .expect(404); // S'attendre à un 404
    // Vous pourriez aussi vouloir vérifier la structure de l'erreur 404 via le filtre:
    // .expect((res) => {
    //    expect(res.body.statusCode).toEqual(404);
    //    expect(res.body.message).toContain('Cannot GET /api');
    // });
  });

  // Ajoutez d'autres tests E2E ici pour vos vrais endpoints plus tard
  // it('/api/auth/login (POST - Should fail without body)', () => { ... });
});
