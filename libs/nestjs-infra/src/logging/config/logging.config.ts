/**
 * 日志模块配置
 *
 * @description 基于 class-validator 的类型安全配置
 *
 * @since 0.3.0
 */

import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

/**
 * 日志级别
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志模块配置
 */
export class LoggingModuleConfig {
  /**
   * 日志级别
   *
   * @default 'info'
   */
  @IsString()
  @IsOptional()
  @IsIn(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
  level?: LogLevel;

  /**
   * 是否启用美化输出
   *
   * @description 开发环境建议启用，生产环境建议禁用
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  prettyPrint?: boolean;

  /**
   * 服务名称
   *
   * @description 用于标识日志来源
   * @optional
   */
  @IsString()
  @IsOptional()
  serviceName?: string;
}

