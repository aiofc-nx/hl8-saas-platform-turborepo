/**
 * 日志模块
 *
 * @description 提供结构化日志功能
 *
 * @since 0.2.0
 */

import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService, LoggerOptions } from './logger.service.js';

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
   */
  static forRoot(options: LoggerOptions = {}): DynamicModule {
    return {
      module: LoggingModule,
      global: true,
      providers: [
        {
          provide: LoggerService,
          useFactory: () => new LoggerService(undefined, options),
        },
      ],
      exports: [LoggerService],
    };
  }
}

