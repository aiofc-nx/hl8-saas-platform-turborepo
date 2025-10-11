/**
 * 异常模块配置
 *
 * @description 定义异常模块的配置选项
 *
 * ## 业务规则
 *
 * ### 配置规则
 * - 所有配置项都是可选的
 * - 未配置的项使用默认值
 * - 配置支持同步和异步方式
 *
 * @since 0.1.0
 */

import { ModuleMetadata, Type } from '@nestjs/common';
import { ExceptionMessageProvider } from '../providers/exception-message.provider';
import { ILoggerService } from '../filters/http-exception.filter';

/**
 * 异常模块配置
 *
 * @description 异常模块的配置选项
 */
export interface ExceptionModuleOptions {
  /**
   * 是否启用日志记录
   *
   * @default true
   */
  enableLogging?: boolean;

  /**
   * 日志服务
   *
   * @description 自定义日志服务实现
   * @optional
   */
  logger?: ILoggerService;

  /**
   * 消息提供者
   *
   * @description 自定义消息提供者实现
   * @optional
   */
  messageProvider?: ExceptionMessageProvider;

  /**
   * 是否为生产环境
   *
   * @description 控制错误详情的暴露程度
   * @default 根据 NODE_ENV 自动判断
   */
  isProduction?: boolean;

  /**
   * 是否全局注册过滤器
   *
   * @description 自动注册 HttpExceptionFilter 和 AnyExceptionFilter
   * @default true
   */
  registerGlobalFilters?: boolean;
}

/**
 * 异常模块异步配置
 *
 * @description 支持异步方式配置异常模块
 */
export interface ExceptionModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * 使用工厂函数配置
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<ExceptionModuleOptions> | ExceptionModuleOptions;

  /**
   * 依赖注入
   */
  inject?: any[];

  /**
   * 使用类配置
   */
  useClass?: Type<ExceptionOptionsFactory>;

  /**
   * 使用现有实例配置
   */
  useExisting?: Type<ExceptionOptionsFactory>;
}

/**
 * 异常配置工厂接口
 *
 * @description 用于创建异常模块配置的工厂
 */
export interface ExceptionOptionsFactory {
  /**
   * 创建异常模块配置
   *
   * @returns 配置对象或 Promise
   */
  createExceptionOptions():
    | Promise<ExceptionModuleOptions>
    | ExceptionModuleOptions;
}

/**
 * 异常配置令牌
 *
 * @description 用于依赖注入的配置令牌
 */
export const EXCEPTION_MODULE_OPTIONS = 'EXCEPTION_MODULE_OPTIONS';

/**
 * 默认配置
 *
 * @description 异常模块的默认配置
 */
export const DEFAULT_EXCEPTION_OPTIONS: ExceptionModuleOptions = {
  enableLogging: true,
  registerGlobalFilters: true,
  isProduction: process.env.NODE_ENV === 'production',
};

