/**
 * 数据库管理模块
 *
 * @description HL8 SAAS平台数据库管理核心模块
 *
 * ## 业务规则
 *
 * ### 模块化设计规则
 * - 支持同步和异步配置方式
 * - 自动注册为全局模块
 * - 集成 MikroORM 和 nestjs-cls
 *
 * ### 依赖注入规则
 * - 使用常量令牌避免循环依赖
 * - 所有服务自动注册并导出
 * - 支持工厂模式配置
 *
 * ### 生命周期规则
 * - onModuleInit: 建立数据库连接
 * - onModuleDestroy: 优雅关闭连接
 *
 * @example
 * ```typescript
 * // 同步配置
 * @Module({
 *   imports: [
 *     DatabaseModule.forRoot({
 *       connection: {
 *         type: 'postgresql',
 *         host: 'localhost',
 *         port: 5432,
 *         database: 'hl8_saas',
 *         username: 'postgres',
 *         password: 'password',
 *       },
 *       entities: [User, Tenant],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // 异步配置（推荐）
 * @Module({
 *   imports: [
 *     DatabaseModule.forRootAsync({
 *       useFactory: (config: DatabaseConfig) => ({
 *         connection: config.getConnectionConfig(),
 *         pool: config.getPoolConfig(),
 *         entities: [User, Tenant],
 *       }),
 *       inject: [DatabaseConfig],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @since 1.0.0
 */

import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DI_TOKENS } from './constants/tokens.js';
import { POOL_DEFAULTS } from './constants/defaults.js';
import { ConnectionManager } from './connection/connection.manager.js';
import type { DatabaseModuleOptions, DatabaseModuleAsyncOptions } from './types/module.types.js';

/**
 * 数据库管理模块
 *
 * @description 提供数据库连接、事务管理、多租户隔离等功能
 */
@Global()
@Module({})
export class DatabaseModule {
  /**
   * 配置数据库模块（同步方式）
   *
   * @description 使用同步配置方式初始化数据库模块
   *
   * @param options - 数据库模块配置选项
   * @returns 动态模块配置
   */
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DI_TOKENS.MODULE_OPTIONS,
        useValue: options,
      },
      ConnectionManager,
    ];

    return {
      module: DatabaseModule,
      imports: [
        // 集成 nestjs-cls 用于上下文管理
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
          },
        }),
        // 集成 MikroORM
        MikroOrmModule.forRoot({
          type: options.connection.type,
          host: options.connection.host,
          port: options.connection.port,
          dbName: options.connection.database,
          user: options.connection.username,
          password: options.connection.password,
          entities: options.entities,
          pool: {
            min: options.pool?.min ?? POOL_DEFAULTS.MIN,
            max: options.pool?.max ?? POOL_DEFAULTS.MAX,
            idleTimeoutMillis: options.pool?.idleTimeoutMillis ?? POOL_DEFAULTS.IDLE_TIMEOUT,
            acquireTimeoutMillis: options.pool?.acquireTimeoutMillis ?? POOL_DEFAULTS.ACQUIRE_TIMEOUT,
            createTimeoutMillis: options.pool?.createTimeoutMillis ?? POOL_DEFAULTS.CREATE_TIMEOUT,
          },
          debug: options.debug ?? false,
          ...options.mikroORM,
        } as any),
      ],
      providers,
      exports: [
        DI_TOKENS.MODULE_OPTIONS,
        ConnectionManager,
      ],
    };
  }

  /**
   * 配置数据库模块（异步方式）
   *
   * @description 使用异步配置方式初始化数据库模块，适用于从配置服务获取配置的场景
   *
   * @param options - 异步配置选项
   * @returns 动态模块配置
   */
  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DI_TOKENS.MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      ConnectionManager,
    ];

    return {
      module: DatabaseModule,
      imports: [
        // 集成 nestjs-cls
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
          },
        }),
        // MikroORM 异步配置
        MikroOrmModule.forRootAsync({
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            
            return {
              type: config.connection.type,
              host: config.connection.host,
              port: config.connection.port,
              dbName: config.connection.database,
              user: config.connection.username,
              password: config.connection.password,
              entities: config.entities,
              pool: {
                min: config.pool?.min ?? POOL_DEFAULTS.MIN,
                max: config.pool?.max ?? POOL_DEFAULTS.MAX,
                idleTimeoutMillis: config.pool?.idleTimeoutMillis ?? POOL_DEFAULTS.IDLE_TIMEOUT,
                acquireTimeoutMillis: config.pool?.acquireTimeoutMillis ?? POOL_DEFAULTS.ACQUIRE_TIMEOUT,
                createTimeoutMillis: config.pool?.createTimeoutMillis ?? POOL_DEFAULTS.CREATE_TIMEOUT,
              },
              debug: config.debug ?? false,
              ...config.mikroORM,
            } as any;
          },
          inject: options.inject || [],
        }),
      ],
      providers,
      exports: [
        DI_TOKENS.MODULE_OPTIONS,
        ConnectionManager,
      ],
    };
  }
}

