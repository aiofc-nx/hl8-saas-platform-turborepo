/**
 * 类型安全配置模块
 *
 * @description 提供类型安全的配置管理
 *
 * @since 0.3.0
 */

import { Module, DynamicModule, Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ConfigValidator } from './validators/config.validator.js';

/**
 * 配置加载器接口
 */
export interface ConfigLoader {
  load(): Promise<any> | any;
}

/**
 * 配置模块选项
 */
export interface TypedConfigModuleOptions {
  /** 配置 Schema 类 */
  schema: Type<any>;
  /** 配置加载器 */
  loaders?: ConfigLoader[];
  /** 是否验证 */
  validate?: boolean;
}

/**
 * 配置模块异步选项
 */
export interface TypedConfigModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<TypedConfigModuleOptions> | TypedConfigModuleOptions;
  inject?: any[];
  imports?: any[];
}

/**
 * 类型安全配置模块
 */
@Module({})
export class TypedConfigModule {
  /**
   * 同步配置模块
   *
   * @param options - 配置选项
   * @returns 动态模块
   */
  static forRoot(options: TypedConfigModuleOptions): DynamicModule {
    return {
      module: TypedConfigModule,
      global: true,
      providers: [
        {
          provide: options.schema,
          useFactory: async () => {
            // 加载配置
            let config = {};
            if (options.loaders && options.loaders.length > 0) {
              for (const loader of options.loaders) {
                const loaded = await loader.load();
                config = { ...config, ...loaded };
              }
            }

            // 验证配置
            if (options.validate) {
              return ConfigValidator.validate(options.schema, config);
            }

            // 转换为类实例（即使不验证也需要类型转换）
            return plainToClass(options.schema, config);
          },
        },
      ],
      exports: [options.schema],
    };
  }

  /**
   * 异步配置模块
   *
   * @param options - 异步配置选项
   * @returns 动态模块
   */
  static forRootAsync(options: TypedConfigModuleAsyncOptions): DynamicModule {
    return {
      module: TypedConfigModule,
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: 'CONFIG_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'CONFIG_INSTANCE',
          useFactory: async (moduleOptions: TypedConfigModuleOptions) => {
            // 加载配置
            let config = {};
            if (moduleOptions.loaders && moduleOptions.loaders.length > 0) {
              for (const loader of moduleOptions.loaders) {
                const loaded = await loader.load();
                config = { ...config, ...loaded };
              }
            }

            // 验证配置
            if (moduleOptions.validate) {
              return ConfigValidator.validate(moduleOptions.schema, config);
            }

            // 转换为类实例（即使不验证也需要类型转换）
            return plainToClass(moduleOptions.schema, config);
          },
          inject: ['CONFIG_MODULE_OPTIONS'],
        },
        {
          provide: 'CONFIG_SCHEMA',
          useFactory: (moduleOptions: TypedConfigModuleOptions) => moduleOptions.schema,
          inject: ['CONFIG_MODULE_OPTIONS'],
        },
      ],
      exports: ['CONFIG_INSTANCE', 'CONFIG_SCHEMA'],
    };
  }
}

