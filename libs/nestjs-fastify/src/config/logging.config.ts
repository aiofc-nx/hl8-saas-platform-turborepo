/**
 * 日志模块配置
 *
 * 定义 Fastify 日志模块的配置选项，包括日志级别、格式、输出目标等。
 *
 * @description 提供类型安全的日志配置管理，支持运行时配置验证和环境变量覆盖。
 * 遵循 12-Factor App 配置原则，支持灵活的日志配置。
 *
 * ## 业务规则
 *
 * ### 日志级别规则
 * - fatal: 致命错误，应用无法继续运行
 * - error: 错误信息，需要立即关注
 * - warn: 警告信息，可能存在问题
 * - info: 常规信息，正常业务流程
 * - debug: 调试信息，开发阶段使用
 * - trace: 跟踪信息，详细的执行路径
 * - silent: 禁用所有日志
 *
 * ### 格式化规则
 * - 生产环境：使用 JSON 格式，便于日志聚合和分析
 * - 开发环境：使用 pretty 格式，便于阅读和调试
 * - 支持自定义格式化函数
 *
 * ### 输出规则
 * - 支持标准输出（stdout）
 * - 支持文件输出
 * - 支持远程日志服务
 * - 支持多个输出目标
 *
 * ### 隔离上下文规则
 * - 自动包含租户 ID
 * - 自动包含组织 ID
 * - 自动包含用户 ID
 * - 支持自定义上下文字段
 *
 * @example
 * ```typescript
 * import { LoggingConfig } from '@hl8/nestjs-fastify';
 * import { Type } from 'class-transformer';
 * import { IsString, IsBoolean, ValidateNested } from 'class-validator';
 *
 * class AppConfig {
 *   @ValidateNested()
 *   @Type(() => LoggingConfig)
 *   logging: LoggingConfig;
 * }
 *
 * // 使用配置
 * const config = {
 *   logging: {
 *     level: 'info',
 *     prettyPrint: false,
 *     includeIsolationContext: true
 *   }
 * };
 * ```
 *
 * @since 0.1.0
 */

import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * 日志级别类型
 *
 * @description 定义支持的日志级别
 */
export type LogLevel =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'silent';

/**
 * 日志配置类
 *
 * @description 日志模块的配置选项
 *
 * @class LoggingConfig
 */
export class LoggingConfig {
  /**
   * 日志级别
   *
   * @description 设置最低日志级别，低于此级别的日志将被忽略
   *
   * ## 业务规则
   * - 生产环境建议使用 'info' 或 'warn'
   * - 开发环境建议使用 'debug' 或 'trace'
   * - 性能测试时可使用 'silent' 禁用日志
   *
   * @default 'info'
   */
  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  @IsOptional()
  level: LogLevel = 'info';

  /**
   * 是否使用美化输出
   *
   * @description 启用后将使用 pino-pretty 进行格式化，便于阅读
   *
   * ## 业务规则
   * - 开发环境建议启用
   * - 生产环境建议禁用（使用 JSON 格式）
   * - 禁用时输出 JSON 格式，便于日志分析系统处理
   *
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  prettyPrint: boolean = false;

  /**
   * 是否包含隔离上下文
   *
   * @description 是否在日志中自动包含隔离上下文（租户ID、组织ID等）
   *
   * ## 业务规则
   * - SAAS 应用建议启用
   * - 多租户场景必须启用
   * - 有助于日志追踪和问题定位
   *
   * @default true
   */
  @IsBoolean()
  @IsOptional()
  includeIsolationContext: boolean = true;

  /**
   * 是否包含时间戳
   *
   * @description 是否在日志中包含时间戳
   *
   * ## 业务规则
   * - 生产环境必须启用
   * - 便于日志时序分析
   * - ISO 8601 格式
   *
   * @default true
   */
  @IsBoolean()
  @IsOptional()
  timestamp: boolean = true;

  /**
   * 日志文件路径
   *
   * @description 日志文件的输出路径，未设置则仅输出到控制台
   *
   * ## 业务规则
   * - 生产环境建议设置
   * - 支持日志轮转
   * - 路径必须可写
   *
   * @optional
   */
  @IsString()
  @IsOptional()
  logFile?: string;

  /**
   * 是否记录请求详情
   *
   * @description 是否记录 HTTP 请求的详细信息（headers、body等）
   *
   * ## 业务规则
   * - 开发环境建议启用
   * - 生产环境需谨慎启用（可能包含敏感信息）
   * - 可能影响性能
   *
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  logRequestDetails: boolean = false;

  /**
   * 是否记录响应详情
   *
   * @description 是否记录 HTTP 响应的详细信息
   *
   * ## 业务规则
   * - 开发环境建议启用
   * - 生产环境需谨慎启用
   * - 可能影响性能
   *
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  logResponseDetails: boolean = false;

  /**
   * 是否启用日志
   *
   * @description 全局开关，禁用后不会产生任何日志
   *
   * ## 业务规则
   * - 通常应保持启用
   * - 特殊场景（如性能测试）可临时禁用
   *
   * @default true
   */
  @IsBoolean()
  @IsOptional()
  enabled: boolean = true;
}

