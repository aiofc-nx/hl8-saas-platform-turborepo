/**
 * Fastify 异常处理模块
 *
 * @description Fastify 专用的异常处理模块，使用 Fastify 兼容的过滤器
 *
 * @since 0.1.0
 */

import { Module, DynamicModule, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { FastifyHttpExceptionFilter } from './filters/fastify-http-exception.filter.js';
import { FastifyAnyExceptionFilter } from './filters/fastify-any-exception.filter.js';

export interface FastifyExceptionModuleOptions {
  isProduction?: boolean;
}

@Global()
@Module({})
export class FastifyExceptionModule {
  static forRoot(options: FastifyExceptionModuleOptions = {}): DynamicModule {
    return {
      module: FastifyExceptionModule,
      global: true,
      providers: [
        {
          provide: APP_FILTER,
          useClass: FastifyHttpExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useFactory: () => {
            return new FastifyAnyExceptionFilter(options.isProduction);
          },
        },
      ],
    };
  }
}

