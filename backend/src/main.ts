import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });

  const logger = new Logger('DatabaseBootstrap');
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUser = process.env.DB_USERNAME || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_DATABASE || 'store_rating_db';

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    logger.log(`Database "${dbName}" checked/created successfully.`);
  } catch (error: any) {
    logger.warn(`MySQL unavailable. Using SQLite fallback. ${error.message}`);
    process.env.DB_FALLBACK_SQLITE = 'true';
  }

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend Server running on port ${port}`);
}
bootstrap();
