/**
 * Pino 配置工厂
 *
 * @description 提供统一的 Pino 日志配置，避免多处散落配置
 * 支持开发环境和生产环境的不同配置需求
 *
 * ## 业务规则
 *
 * ### 配置规则
 * - 开发环境：启用美化输出，包含颜色和格式化
 * - 生产环境：JSON 格式输出，便于日志收集
 * - 统一序列化器：确保 Error、Request、Response 对象正确序列化
 * - 可配置日志级别：支持环境变量控制
 *
 * ### 序列化规则
 * - Error 对象：提取 type、message、stack
 * - Request 对象：提取 method、url、headers
 * - Response 对象：提取 statusCode
 * - 避免敏感信息泄露
 *
 * @since 0.1.0
 */

import type { LoggerOptions } from 'pino';

/**
 * Pino 配置选项
 */
export interface PinoConfigOptions {
  /** 日志级别 */
  level?: string;
  /** 是否启用美化输出 */
  prettyPrint?: boolean;
  /** 是否启用颜色 */
  colorize?: boolean;
  /** 时间格式 */
  translateTime?: string;
  /** 忽略的字段 */
  ignore?: string;
}

/**
 * 默认序列化器
 */
export const DEFAULT_SERIALIZERS = {
  /**
   * 错误对象序列化器
   */
  err: (err: Error) => ({
    type: err.constructor.name,
    message: err.message,
    stack: err.stack,
  }),

  /**
   * 请求对象序列化器
   */
  req: (req: any) => ({
    method: req.method,
    url: req.url,
    headers: req.headers,
  }),

  /**
   * 响应对象序列化器
   */
  res: (res: any) => ({
    statusCode: res.statusCode,
  }),
} as const;

/**
 * 创建开发环境 Pino 配置
 *
 * @param options - 配置选项
 * @returns Pino 配置对象
 */
export function createDevelopmentPinoConfig(
  options: PinoConfigOptions = {},
): LoggerOptions {
  const {
    level = 'debug',
    prettyPrint = true,
    colorize = true,
    translateTime = 'SYS:standard',
    ignore = 'pid,hostname',
  } = options;

  return {
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize,
        translateTime,
        ignore,
      },
    },
    serializers: DEFAULT_SERIALIZERS,
  };
}

/**
 * 创建生产环境 Pino 配置
 *
 * @param options - 配置选项
 * @returns Pino 配置对象
 */
export function createProductionPinoConfig(
  options: PinoConfigOptions = {},
): LoggerOptions {
  const { level = 'info' } = options;

  return {
    level,
    serializers: DEFAULT_SERIALIZERS,
  };
}

/**
 * 创建 Pino 配置（自动检测环境）
 *
 * @param options - 配置选项
 * @returns Pino 配置对象
 */
export function createPinoConfig(
  options: PinoConfigOptions = {},
): LoggerOptions {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return createDevelopmentPinoConfig(options);
  }

  return createProductionPinoConfig(options);
}

/**
 * 创建 Fastify 日志配置
 *
 * @param options - 配置选项
 * @returns Fastify 日志配置对象
 */
export function createFastifyLoggerConfig(
  options: PinoConfigOptions = {},
): LoggerOptions {
  return createPinoConfig(options);
}
