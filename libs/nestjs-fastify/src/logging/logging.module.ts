/**
 * Fastify 日志模块
 *
 * @description 零配置的 Fastify 日志模块，自动使用 Fastify 内置的 Pino
 *
 * @since 0.1.0
 */

import { Module, DynamicModule, Global } from '@nestjs/common';
import { HTTP_ADAPTER_HOST } from '@nestjs/core';
import { FastifyLoggerService } from './fastify-logger.service.js';

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
          useFactory: (httpAdapterHost: any) => {
            // 获取 Fastify 实例
            const fastifyInstance = httpAdapterHost?.httpAdapter?.getInstance?.();
            
            if (fastifyInstance?.log) {
              // 使用 Fastify 的 Pino 实例
              return new FastifyLoggerService(fastifyInstance.log);
            }
            
            // 降级方案：创建新的 Pino 实例
            const pino = require('pino');
            return new FastifyLoggerService(pino({ level: 'info' }));
          },
          inject: [HTTP_ADAPTER_HOST],
        },
      ],
      exports: [FastifyLoggerService],
    };
  }
}

