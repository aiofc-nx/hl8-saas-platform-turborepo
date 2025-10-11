/**
 * 日志模块
 *
 * @description 提供结构化日志功能，优先复用 Fastify 的 Pino 实例
 *
 * ## 设计原则
 *
 * ### Fastify 集成优先
 * - 自动检测 Fastify 适配器
 * - 复用 Fastify 的 Pino 实例
 * - 避免创建多个日志实例
 * - 统一配置，统一输出
 *
 * ### 独立使用支持
 * - 非 Fastify 场景创建独立 Pino 实例
 * - 支持自定义配置
 *
 * @since 0.2.0
 */

import { Module, DynamicModule } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService, LoggerOptions } from './logger.service.js';
import { ConfigValidator } from '../configuration/validators/config.validator.js';
import { LoggingModuleConfig } from './config/logging.config.js';

/**
 * 日志模块
 */
@Module({})
export class LoggingModule {
  /**
   * 配置日志模块
   *
   * @param options - 日志选项
   * @returns 动态模块
   * @throws {GeneralBadRequestException} 配置验证失败
   *
   * @description
   * - 优先检测并复用 Fastify 的 Pino 实例
   * - 如果不是 Fastify，则创建新的 Pino 实例
   *
   * @example
   * ```typescript
   * // Fastify 应用（自动复用 Fastify Pino）
   * @Module({
   *   imports: [LoggingModule.forRoot()],
   * })
   *
   * // 独立使用（创建新的 Pino）
   * @Module({
   *   imports: [
   *     LoggingModule.forRoot({
   *       level: 'debug',
   *       prettyPrint: true,
   *     }),
   *   ],
   * })
   * ```
   */
  static forRoot(options: LoggerOptions = {}): DynamicModule {
    // 验证配置（如果提供了配置）
    let validatedOptions = options;
    if (Object.keys(options).length > 0) {
      const validatedConfig = ConfigValidator.validate(LoggingModuleConfig, options);
      validatedOptions = {
        level: validatedConfig.level,
        prettyPrint: validatedConfig.prettyPrint,
      };
    }

    return {
      module: LoggingModule,
      global: true,
      providers: [
        {
          provide: LoggerService,
          useFactory: (httpAdapterHost?: HttpAdapterHost) => {
            // 尝试获取 Fastify 的 Pino 实例
            try {
              const httpAdapter = httpAdapterHost?.httpAdapter;
              if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
                const fastifyInstance = httpAdapter.getInstance();
                
                // 检查是否是 Fastify 实例且有 log 属性
                if (fastifyInstance && fastifyInstance.log) {
                  // 复用 Fastify 的 Pino 实例
                  return new LoggerService(undefined, fastifyInstance.log);
                }
              }
            } catch (error) {
              // 如果获取 Fastify 实例失败，继续创建新实例
            }

            // 创建新的 Pino 实例（非 Fastify 场景）
            return new LoggerService(undefined, validatedOptions);
          },
          inject: [{ token: HttpAdapterHost, optional: true }],
        },
      ],
      exports: [LoggerService],
    };
  }
}

