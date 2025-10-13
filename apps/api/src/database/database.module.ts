/**
 * Database module for configuring TypeORM with PostgreSQL in a NestJS application.
 *
 * Uses asynchronous configuration to load database connection settings from environment variables via ConfigService.
 * Supports SSL, logging, and entity autoloading. Synchronization is disabled in production.
 */
import { Env } from '@/common/utils';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * DatabaseModule class that imports TypeOrmModule with async configuration.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') || '5432', 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        ssl: config.get('DB_SSL') ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: true, // 临时启用同步模式来创建表
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
