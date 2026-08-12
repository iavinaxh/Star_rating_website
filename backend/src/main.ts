import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });

  const isProduction = process.env.NODE_ENV === 'production';
  const logger = new Logger('DatabaseBootstrap');
  const dbHost = process.env.DB_HOST;
  const dbPort = Number.parseInt(process.env.DB_PORT || '3306', 10);
  const dbUser = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_DATABASE;

  if (isProduction && (!dbHost || !dbUser || !dbName)) {
    throw new Error('Production database configuration is incomplete. Set DB_HOST, DB_USERNAME, DB_PASSWORD and DB_DATABASE.');
  }

  if (!isProduction && !dbHost) {
    process.env.DB_FALLBACK_SQLITE = 'true';
    logger.log('No DB_HOST configured. Using SQLite for local development.');
  } else if (dbHost && dbUser && dbName) {
    try {
      const connection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword || '',
        database: dbName,
      });
      await connection.ping();
      await connection.end();
      logger.log(`Connected to MySQL database "${dbName}" successfully.`);
    } catch (error: any) {
      if (isProduction) {
        logger.error(`Database connection failed: ${error.message}`);
        throw error;
      }

      logger.warn(`MySQL unavailable in development. Using SQLite fallback. ${error.message}`);
      process.env.DB_FALLBACK_SQLITE = 'true';
    }
  }

  const app = await NestFactory.create(AppModule);

  const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (isProduction && configuredOrigins.length === 0) {
    throw new Error('FRONTEND_URL must be configured in production.');
  }

  app.enableCors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number.parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  logger.log(`Backend server is listening on port ${port}`);
}

bootstrap();
