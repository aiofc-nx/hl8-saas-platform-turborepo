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
 *
 * @since 0.1.0
 */

import { Module, DynamicModule, Global } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyLoggerService } from './fastify-logger.service.js';
import { IsolationContextService } from '@hl8/nestjs-infra';

@Global()
@Module({})
export class FastifyLoggingModule {
  static forRoot(): DynamicModule {
    return {
      module: FastifyLoggingModule,
      global: true,
      providers: [
        {
          provide: FastifyLoggerService,
          useFactory: (
            httpAdapterHost: HttpAdapterHost,
            isolationService?: IsolationContextService,
          ) => {
            // 获取 Fastify 实例
            const fastifyInstance = httpAdapterHost?.httpAdapter?.getInstance?.();
            
            if (fastifyInstance?.log) {
              // 使用 Fastify 的 Pino 实例（零开销）
              return new FastifyLoggerService(fastifyInstance.log, isolationService);
            }
            
            // 降级方案：创建新的 Pino 实例
            const pino = require('pino');
            return new FastifyLoggerService(pino({ level: 'info' }), isolationService);
          },
          inject: [
            HttpAdapterHost,
            { token: IsolationContextService, optional: true },
          ],
        },
      ],
      exports: [FastifyLoggerService],
    };
  }
}

