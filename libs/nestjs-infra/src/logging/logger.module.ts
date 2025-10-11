/**
 * 日志模块
 *
 * @description 提供结构化日志功能
 *
 * @since 0.2.0
 */

import { Module, DynamicModule } from '@nestjs/common';
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
          useFactory: () => new LoggerService(undefined, validatedOptions),
        },
      ],
      exports: [LoggerService],
    };
  }
}

