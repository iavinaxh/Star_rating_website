import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  // Load environment variables manually for early DB creation
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
    logger.error('===================================================================');
    logger.error(`DATABASE INITIALIZATION ERROR: Could not connect to MySQL at ${dbHost}:${dbPort}`);
    logger.error(`Error details: ${error.message}`);
    logger.error('Please make sure:');
    logger.error('1. Your MySQL server is running.');
    logger.error('2. The password in backend/.env is correct.');
    logger.error('Once verified, the application will automatically create the tables.');
    logger.error('-------------------------------------------------------------------');
    logger.warn('⚠️ FALLING BACK TO LOCAL SQLITE DATABASE FOR SEAMLESS RUNTIME ⚠️');
    logger.error('===================================================================');
    process.env.DB_FALLBACK_SQLITE = 'true';
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for testing
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend Server is running on: http://localhost:${port}`);
}
bootstrap();
