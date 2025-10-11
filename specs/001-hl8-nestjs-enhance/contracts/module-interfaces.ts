/**
 * 模块公共接口定义
 *
 * @description 定义所有功能模块的公共接口
 * @packageDocumentation
 */

// ============================================================================
// 异常处理模块接口（P0 - CRITICAL）⭐
// ============================================================================

/**
 * 异常模块配置选项
 */
export interface ExceptionModuleOptions {
  /** 文档链接 URL */
  documentationUrl?: string;
  /** 消息提供者 */
  messageProvider?: ExceptionMessageProvider;
  /** 日志级别 */
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  /** 是否启用堆栈跟踪 */
  enableStackTrace?: boolean;
  /** 是否启用请求日志记录 */
  enableRequestLogging?: boolean;
  /** 是否启用响应日志记录 */
  enableResponseLogging?: boolean;
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
}

/**
 * 消息提供者接口
 */
export interface ExceptionMessageProvider {
  /**
   * 获取异常消息
   *
   * @param errorCode - 错误码
   * @param messageType - 消息类型（title 或 detail）
   * @param params - 消息参数
   * @returns 消息字符串或 undefined
   */
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, any>
  ): string | undefined;

  /**
   * 检查是否有消息
   *
   * @param errorCode - 错误码
   * @param messageType - 消息类型
   * @returns 是否存在消息
   */
  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean;

  /**
   * 获取所有可用的错误码
   *
   * @returns 错误码数组
   */
  getAvailableErrorCodes?(): string[];
}

/**
 * RFC7807 问题详情接口
 */
export interface ProblemDetails {
  /** 错误类型 URI */
  type: string;
  /** 错误标题 */
  title: string;
  /** 错误详情 */
  detail: string;
  /** HTTP 状态码 */
  status: number;
  /** 请求实例标识 */
  instance?: string;
  /** 错误码 */
  errorCode?: string;
  /** 附加数据 */
  data?: any;
}

/**
 * HTTP 异常接口
 */
export interface IHttpException {
  /** 错误码 */
  errorCode: string;
  /** 错误标题 */
  title: string;
  /** 错误详情 */
  detail: string;
  /** HTTP 状态码 */
  status: number;
  /** 附加数据 */
  data?: any;
  /** 错误类型 */
  type?: string;
  /** 根因异常 */
  rootCause?: Error;
  
  /**
   * 转换为 RFC7807 格式
   */
  toRFC7807(): ProblemDetails;
}

// ============================================================================
// 缓存模块接口
// ============================================================================

/**
 * 缓存模块配置选项
 */
export interface CachingModuleOptions {
  /** Redis 连接配置 */
  redis: RedisOptions;
  /** 默认 TTL（秒） */
  defaultTTL?: number;
  /** 缓存键前缀 */
  keyPrefix?: string;
  /** 是否启用租户隔离 */
  enableTenantIsolation?: boolean;
}

/**
 * Redis 连接选项
 */
export interface RedisOptions {
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 密码 */
  password?: string;
  /** 数据库编号 */
  db?: number;
  /** 连接超时（毫秒） */
  connectTimeout?: number;
}

/**
 * 缓存服务接口
 */
export interface ICacheService {
  /**
   * 设置缓存
   *
   * @param namespace - 缓存命名空间
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（秒），可选
   */
  set<T>(namespace: string, key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 获取缓存
   *
   * @param namespace - 缓存命名空间
   * @param key - 缓存键
   * @returns 缓存值或 null
   */
  get<T>(namespace: string, key: string): Promise<T | null>;

  /**
   * 删除缓存
   *
   * @param namespace - 缓存命名空间
   * @param key - 缓存键
   */
  del(namespace: string, key: string): Promise<void>;

  /**
   * 检查缓存是否存在
   *
   * @param namespace - 缓存命名空间
   * @param key - 缓存键
   */
  exists(namespace: string, key: string): Promise<boolean>;
}

// ============================================================================
// 配置模块接口
// ============================================================================

/**
 * 配置模块选项
 */
export interface TypedConfigModuleOptions<T = any> {
  /** 配置 Schema 类 */
  schema: new () => T;
  /** 配置加载器 */
  load: ConfigLoader[];
  /** 是否验证配置 */
  validate?: boolean;
  /** 验证选项 */
  validateOptions?: ValidationOptions;
}

/**
 * 配置加载器接口
 */
export interface ConfigLoader {
  /**
   * 加载配置
   *
   * @returns 配置对象
   */
  load(): Promise<Record<string, any>>;
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  /** 是否允许白名单 */
  whitelist?: boolean;
  /** 是否禁止非白名单属性 */
  forbidNonWhitelisted?: boolean;
}

// ============================================================================
// 日志模块接口
// ============================================================================

/**
 * 日志模块配置选项
 */
export interface LoggingModuleOptions {
  /** 日志级别 */
  level?: LogLevel;
  /** 是否美化输出（仅开发环境） */
  prettyPrint?: boolean;
  /** 是否包含上下文信息 */
  includeContext?: boolean;
}

/**
 * 日志级别
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志服务接口
 */
export interface ILoggerService {
  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  log(message: string, context?: any): void;

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param trace - 错误堆栈
   * @param context - 额外上下文
   */
  error(message: string, trace?: string, context?: any): void;

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  warn(message: string, context?: any): void;

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param context - 额外上下文
   */
  debug(message: string, context?: any): void;
}

// ============================================================================
// 数据隔离模块接口
// ============================================================================

/**
 * 数据隔离模块配置选项
 */
export interface IsolationModuleOptions {
  /** 是否全局模块 */
  global?: boolean;
  /** 租户标识符提取策略 */
  extractionStrategy?: TenantExtractionStrategy;
  /** 是否启用多层级隔离 */
  enableMultiLevelIsolation?: boolean;
}

/**
 * 租户提取策略
 */
export type TenantExtractionStrategy = 'header' | 'subdomain' | 'custom';

/**
 * 租户上下文服务接口
 */
export interface IIsolationContextService {
  /**
   * 设置隔离上下文
   *
   * @param context - 隔离上下文
   */
  setIsolationContext(context: IsolationContext): void;

  /**
   * 获取隔离上下文
   *
   * @returns 隔离上下文
   */
  getIsolationContext(): IsolationContext | undefined;

  /**
   * 获取租户 ID
   *
   * @returns 租户 ID
   */
  getTenantId(): string | undefined;

  /**
   * 获取组织 ID
   *
   * @returns 组织 ID
   */
  getOrganizationId(): string | undefined;

  /**
   * 获取部门 ID
   *
   * @returns 部门 ID
   */
  getDepartmentId(): string | undefined;
}

/**
 * 隔离上下文接口
 */
export interface IsolationContext {
  /** 租户 ID */
  tenantId?: string;
  /** 组织 ID */
  organizationId?: string;
  /** 部门 ID */
  departmentId?: string;
  /** 用户 ID */
  userId?: string;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 隔离级别枚举
 */
export enum IsolationLevel {
  /** 平台级（无隔离标识） */
  PLATFORM = 'platform',
  /** 租户级 */
  TENANT = 'tenant',
  /** 组织级 */
  ORGANIZATION = 'organization',
  /** 部门级 */
  DEPARTMENT = 'department',
  /** 用户级 */
  USER = 'user',
}

/**
 * 数据共享级别枚举
 */
export enum DataSharingLevel {
  /** 平台级共享（所有租户可见） */
  PLATFORM = 'platform',
  /** 租户级共享（租户内可见） */
  TENANT = 'tenant',
  /** 组织级共享（组织内可见） */
  ORGANIZATION = 'organization',
  /** 部门级共享（部门内可见） */
  DEPARTMENT = 'department',
  /** 私有（仅所有者可见） */
  PRIVATE = 'private',
}

/**
 * 基础数据模型接口（建议所有业务实体实现）
 *
 * @description 定义业务数据的基础字段，包括隔离和共享控制
 */
export interface BaseDataModel {
  /** 数据唯一标识 */
  id: string;
  
  // === 隔离字段（定义数据归属）===
  /** 租户ID（可为空表示平台级数据） */
  tenantId?: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID（创建者/所有者） */
  userId?: string;
  
  // === 共享控制字段 ⭐ ===
  /** 是否共享（默认 false） */
  isShared: boolean;
  /** 共享级别（仅当 isShared=true 时有效） */
  sharingLevel?: DataSharingLevel;
  /** 明确共享给哪些对象（可选，ID列表） */
  sharedWith?: string[];
  
  // === 时间戳 ===
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

// ============================================================================
// Fastify 模块接口
// ============================================================================

/**
 * 企业级 Fastify 适配器选项（整合所有功能）
 */
export interface EnterpriseFastifyAdapterOptions {
  /** Fastify 实例选项 */
  fastifyOptions?: FastifyInstanceOptions;
  
  /** 是否启用 CORS（默认启用） */
  enableCors?: boolean;
  /** CORS 选项 */
  corsOptions?: CorsOptions;
  
  /** 是否启用限流（默认禁用） */
  enableRateLimit?: boolean;
  /** 限流选项 */
  rateLimitOptions?: RateLimitOptions;
  
  /** 是否启用熔断器（默认禁用） */
  enableCircuitBreaker?: boolean;
  /** 熔断器选项 */
  circuitBreakerOptions?: CircuitBreakerOptions;
  
  /** 是否启用安全头（默认启用） */
  enableSecurity?: boolean;
  /** 安全选项 */
  securityOptions?: SecurityOptions;
  
  /** 是否启用性能监控（默认启用） */
  enablePerformanceMonitoring?: boolean;
  
  /** 是否启用健康检查端点（默认启用） */
  enableHealthCheck?: boolean;
  /** 健康检查路径 */
  healthCheckPath?: string;
}

/**
 * Fastify 实例选项
 */
export interface FastifyInstanceOptions {
  /** 日志配置 */
  logger?: boolean | any;
  /** 是否信任代理 */
  trustProxy?: boolean;
  /** 请求体大小限制 */
  bodyLimit?: number;
  /** 连接超时（毫秒） */
  connectionTimeout?: number;
  /** 保持连接超时（毫秒） */
  keepAliveTimeout?: number;
}

/**
 * CORS 选项
 */
export interface CorsOptions {
  /** 允许的源 */
  origin?: string | string[] | boolean;
  /** 允许的方法 */
  methods?: string[];
  /** 允许的头 */
  allowedHeaders?: string[];
  /** 暴露的头 */
  exposedHeaders?: string[];
  /** 是否允许凭证 */
  credentials?: boolean;
  /** 预检请求缓存时间（秒） */
  maxAge?: number;
}

/**
 * 限流选项
 */
export interface RateLimitOptions {
  /** 时间窗口（毫秒） */
  timeWindow?: number;
  /** 最大请求数 */
  max?: number;
  /** 是否按租户限流 */
  perTenant?: boolean;
}

/**
 * 熔断器选项
 */
export interface CircuitBreakerOptions {
  /** 失败阈值 */
  threshold?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重置时间（毫秒） */
  resetTimeout?: number;
}

/**
 * 安全选项
 */
export interface SecurityOptions {
  /** 是否启用 Helmet */
  enableHelmet?: boolean;
  /** 是否启用 CSRF 保护 */
  enableCsrf?: boolean;
  /** 是否启用 XSS 过滤 */
  enableXssFilter?: boolean;
}

// ============================================================================
// 共享类型
// ============================================================================

/**
 * 异步模块选项
 */
export interface AsyncModuleOptions<T> {
  /** 导入的模块 */
  imports?: any[];
  /** 使用工厂函数 */
  useFactory?: (...args: any[]) => Promise<T> | T;
  /** 注入的依赖 */
  inject?: any[];
}

/**
 * 动态模块
 */
export interface DynamicModule {
  /** 模块类 */
  module: any;
  /** 提供者 */
  providers?: any[];
  /** 导出 */
  exports?: any[];
  /** 导入 */
  imports?: any[];
  /** 控制器 */
  controllers?: any[];
}

