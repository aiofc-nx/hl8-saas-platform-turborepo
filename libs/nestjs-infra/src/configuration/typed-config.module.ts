/**
 * 类型安全配置模块
 *
 * @description 提供类型安全的配置管理
 *
 * @since 0.3.0
 */

import { Module, DynamicModule } from '@nestjs/common';

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
  schema: any;
  /** 配置加载器 */
  loaders?: ConfigLoader[];
  /** 是否验证 */
  validate?: boolean;
}

/**
 * 类型安全配置模块
 */
@Module({})
export class TypedConfigModule {
  /**
   * 配置模块
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
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['CONFIG_OPTIONS'],
    };
  }
}

