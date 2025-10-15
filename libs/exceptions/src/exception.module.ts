/**
 * 异常处理模块
 *
 * @description 提供统一的异常处理机制，遵循 RFC7807 标准
 *
 * ## 业务规则
 *
 * ### 异常处理规则
 * - 所有业务异常必须继承 AbstractHttpException
 * - 异常响应必须遵循 RFC7807 格式
 * - 未捕获的异常自动转换为 500 错误
 * - 异常详情在生产环境自动脱敏
 *
 * ### 配置规则
 * - 支持同步和异步配置
 * - 支持自定义消息提供者
 * - 支持自定义异常过滤器
 *
 * @example
 * ```typescript
 * // 同步配置
 * @Module({
 *   imports: [
 *     ExceptionModule.forRoot({
 *       enableLogging: true,
 *     }),
 *   ],
 * })
 * class AppModule {}
 *
 * // 异步配置
 * @Module({
 *   imports: [
 *     ExceptionModule.forRootAsync({
 *       useFactory: (config: ConfigService) => ({
 *         enableLogging: config.get('LOGGING_ENABLED'),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * class AppModule {}
 * ```
 *
 * @since 0.1.0
 * @packageDocumentation
 */

import { DynamicModule, Module, Provider } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import {
  DEFAULT_EXCEPTION_OPTIONS,
  EXCEPTION_MODULE_OPTIONS,
  ExceptionModuleAsyncOptions,
  ExceptionModuleOptions,
  ExceptionOptionsFactory,
} from "./config/exception.config.js";
import { AnyExceptionFilter } from "./filters/any-exception.filter.js";
import { HttpExceptionFilter } from "./filters/http-exception.filter.js";
import { DefaultMessageProvider } from "./providers/default-message.provider.js";

/**
 * 异常处理模块
 *
 * @description 提供统一的异常处理功能
 */
@Module({})
export class ExceptionModule {
  /**
   * 同步配置异常模块
   *
   * @param options - 配置选项
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     ExceptionModule.forRoot({
   *       enableLogging: true,
   *       messageProvider: new CustomMessageProvider(),
   *     }),
   *   ],
   * })
   * class AppModule {}
   * ```
   */
  static forRoot(options: ExceptionModuleOptions = {}): DynamicModule {
    const mergedOptions = { ...DEFAULT_EXCEPTION_OPTIONS, ...options };

    const providers: Provider[] = [
      {
        provide: EXCEPTION_MODULE_OPTIONS,
        useValue: mergedOptions,
      },
    ];

    // 注册默认消息提供者（如果没有自定义）
    if (!mergedOptions.messageProvider) {
      providers.push(DefaultMessageProvider);
    }

    // 注册全局过滤器
    if (mergedOptions.registerGlobalFilters) {
      providers.push(
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: AnyExceptionFilter,
        },
      );
    }

    return {
      module: ExceptionModule,
      providers,
      exports: [EXCEPTION_MODULE_OPTIONS],
    };
  }

  /**
   * 异步配置异常模块
   *
   * @param options - 异步配置选项
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     ExceptionModule.forRootAsync({
   *       imports: [ConfigModule],
   *       useFactory: (config: ConfigService) => ({
   *         enableLogging: config.get('LOGGING_ENABLED'),
   *         isProduction: config.get('NODE_ENV') === 'production',
   *       }),
   *       inject: [ConfigService],
   *     }),
   *   ],
   * })
   * class AppModule {}
   * ```
   */
  static forRootAsync(options: ExceptionModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      ...this.createAsyncProviders(options),
      DefaultMessageProvider,
    ];

    // 注册全局过滤器（根据配置）
    providers.push(
      {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
      },
      {
        provide: APP_FILTER,
        useClass: AnyExceptionFilter,
      },
    );

    return {
      module: ExceptionModule,
      imports: options.imports || [],
      providers,
      exports: [EXCEPTION_MODULE_OPTIONS],
    };
  }

  /**
   * 创建异步提供者
   *
   * @param options - 异步配置选项
   * @returns 提供者数组
   *
   * @private
   */
  private static createAsyncProviders(
    options: ExceptionModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: EXCEPTION_MODULE_OPTIONS,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory!(...args);
            return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
          },
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: EXCEPTION_MODULE_OPTIONS,
          useFactory: async (optionsFactory: ExceptionOptionsFactory) => {
            const config = await optionsFactory.createExceptionOptions();
            return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
          },
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: EXCEPTION_MODULE_OPTIONS,
          useFactory: async (optionsFactory: ExceptionOptionsFactory) => {
            const config = await optionsFactory.createExceptionOptions();
            return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
          },
          inject: [options.useExisting],
        },
      ];
    }

    return [];
  }
}
