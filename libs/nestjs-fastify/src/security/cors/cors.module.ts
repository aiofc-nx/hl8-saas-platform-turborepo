/**
 * @fileoverview CORS 配置模块
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import type { CorsOptions } from './types/cors-options.js';
import { DEFAULT_CORS_OPTIONS } from './types/cors-options.js';

@Global()
@Module({})
export class CorsModule {
  static forRoot(options?: CorsOptions): DynamicModule {
    const mergedOptions: CorsOptions = {
      ...DEFAULT_CORS_OPTIONS,
      ...options,
    };

    return {
      module: CorsModule,
      global: true,
      providers: [
        {
          provide: 'CORS_OPTIONS',
          useValue: mergedOptions,
        },
      ],
      exports: ['CORS_OPTIONS'],
    };
  }
}
