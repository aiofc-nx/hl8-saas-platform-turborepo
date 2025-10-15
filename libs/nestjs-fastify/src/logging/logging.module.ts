/**
 * Fastify 日志模块
 *
 * @description 零配置的 Fastify 日志模块，自动使用 Fastify 内置的 Pino
 * 自动包含隔离上下文（租户、组织、部门、用户）
 *
 * ## 特性
 * - ⚡ 零开销（复用 Fastify Pino）
 * - 🎯 自动包含隔离上下文
 * - 🔍 便于日志分析和审计
 * - 🔧 支持配置化（可选）
 *
 * @since 0.1.0
 */

import { ConfigValidator } from "@hl8/config";
import { IsolationContextService } from "@hl8/nestjs-isolation";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import pino from "pino";
import { LoggingConfig } from "../config/logging.config.js";
import { FastifyLoggerService } from "./fastify-logger.service.js";

/**
 * 日志模块选项
 */
export interface FastifyLoggingModuleOptions {
  /** 日志配置 */
  config?: Partial<LoggingConfig>;
}

@Global()
@Module({})
export class FastifyLoggingModule {
  /**
   * 注册日志模块
   *
   * @description 创建并配置日志模块
   *
   * ## 业务规则
   * - 优先使用 Fastify 的 Pino 实例（零开销）
   * - 自动包含隔离上下文
   * - 支持配置验证
   *
   * @param {FastifyLoggingModuleOptions} options - 日志配置选项
   * @returns {DynamicModule} 动态模块
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     FastifyLoggingModule.forRoot({
   *       config: {
   *         level: 'debug',
   *         prettyPrint: true,
   *         includeIsolationContext: true
   *       }
   *     })
   *   ]
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(options?: FastifyLoggingModuleOptions): DynamicModule {
    // 验证和规范化配置
    const loggingConfig = options?.config
      ? ConfigValidator.validate(LoggingConfig, {
          ...new LoggingConfig(),
          ...options.config,
        })
      : new LoggingConfig();

    return {
      module: FastifyLoggingModule,
      global: true,
      providers: [
        // 提供配置实例
        {
          provide: LoggingConfig,
          useValue: loggingConfig,
        },
        // 提供日志服务
        {
          provide: FastifyLoggerService,
          useFactory: (
            httpAdapterHost: HttpAdapterHost,
            config: LoggingConfig,
            isolationService?: IsolationContextService,
          ) => {
            // 如果日志被禁用，返回静默日志实例
            if (!config.enabled) {
              return new FastifyLoggerService(
                pino({ level: "silent" }),
                isolationService,
              );
            }

            // 获取 Fastify 实例
            const fastifyInstance =
              httpAdapterHost?.httpAdapter?.getInstance?.();

            if (!fastifyInstance?.log) {
              throw new Error(
                "无法获取 Fastify 实例。@hl8/nestjs-fastify 必须与 FastifyAdapter 一起使用。" +
                  "请确保在 main.ts 中使用了 FastifyAdapter 或 EnterpriseFastifyAdapter。",
              );
            }

            // 使用 Fastify 的 Pino 实例（零开销）
            return new FastifyLoggerService(
              fastifyInstance.log,
              isolationService,
            );
          },
          inject: [
            HttpAdapterHost,
            LoggingConfig,
            { token: IsolationContextService, optional: true },
          ],
        },
      ],
      exports: [FastifyLoggerService, LoggingConfig],
    };
  }
}
