/**
 * @hl8/nestjs-infra - NestJS 基础设施模块
 *
 * @description 为 NestJS 应用提供企业级基础设施功能，包括：
 * - 统一异常处理（RFC7807标准）
 * - 5层级数据隔离（平台/租户/组织/部门/用户）
 * - Redis 缓存与装饰器
 * - 企业级 Fastify 适配器
 * - 类型安全配置管理
 * - 结构化日志（Pino）
 *
 * @packageDocumentation
 * @author HL8 Team
 * @since 0.1.0
 */

// ============================================================
// 异常处理模块（P0 - CRITICAL）
// ============================================================

/**
 * 异常处理模块
 */
export { ExceptionModule } from './exceptions/exception.module';

/**
 * 异常类
 */
export { AbstractHttpException, ProblemDetails } from './exceptions/core/abstract-http.exception';
export { GeneralNotFoundException } from './exceptions/core/general-not-found.exception';
export { GeneralBadRequestException } from './exceptions/core/general-bad-request.exception';
export { GeneralInternalServerException } from './exceptions/core/general-internal-server.exception';

/**
 * 异常过滤器
 */
export { HttpExceptionFilter, ILoggerService, IExceptionMessageProvider } from './exceptions/filters/http-exception.filter';
export { AnyExceptionFilter } from './exceptions/filters/any-exception.filter';

/**
 * 消息提供者
 */
export { ExceptionMessageProvider } from './exceptions/providers/exception-message.provider';
export { DefaultMessageProvider } from './exceptions/providers/default-message.provider';

/**
 * 异常配置
 */
export {
  ExceptionModuleOptions,
  ExceptionModuleAsyncOptions,
  ExceptionOptionsFactory,
  EXCEPTION_MODULE_OPTIONS,
  DEFAULT_EXCEPTION_OPTIONS,
} from './exceptions/config/exception.config';

// ============================================================
// 共享模块（过渡性领域模型）
// ============================================================

/**
 * 值对象
 */
export { EntityId } from './shared/value-objects/entity-id.vo';
export { TenantId } from './shared/value-objects/tenant-id.vo';
export { OrganizationId } from './shared/value-objects/organization-id.vo';
export { DepartmentId } from './shared/value-objects/department-id.vo';
export { UserId } from './shared/value-objects/user-id.vo';

/**
 * 实体
 */
export { IsolationContext } from './shared/entities/isolation-context.entity';

/**
 * 业务异常
 */
export { TenantNotFoundException } from './shared/exceptions/tenant-not-found.exception';
export { InvalidIsolationContextException } from './shared/exceptions/invalid-isolation-context.exception';
export { UnauthorizedOrganizationException } from './shared/exceptions/unauthorized-organization.exception';

/**
 * 类型定义
 */
export type {
  DeepPartial,
  DeepReadonly,
  Nullable,
  Optional,
  Constructor,
  AbstractConstructor,
  AnyFunction,
  AsyncFunction,
  ValueOf,
  Mutable,
  RequiredKeys,
  OptionalKeys,
} from './shared/types/shared.types';

/**
 * 枚举
 */
export {
  IsolationLevel,
  getIsolationLevelName,
  getIsolationLevelPriority,
  isHigherOrEqualLevel,
} from './shared/enums/isolation-level.enum';

export {
  DataSharingLevel,
  getSharingLevelName,
  getSharingLevelPriority,
  isWiderOrEqualSharing,
} from './shared/enums/data-sharing-level.enum';

// ============================================================
// 通用技术组件
// ============================================================

/**
 * 装饰器
 */
export { Public, IS_PUBLIC_KEY } from './common/decorators/public.decorator';

// ============================================================
// Fastify 适配器模块（Phase 3.1）
// ============================================================

/**
 * 企业级 Fastify 适配器
 */
export { EnterpriseFastifyAdapter } from './fastify/enterprise-fastify.adapter';
export type { EnterpriseFastifyAdapterOptions } from './fastify/enterprise-fastify.adapter';

/**
 * Fastify 配置
 */
export {
  DEFAULT_FASTIFY_CONFIG,
  DEV_FASTIFY_CONFIG,
  PROD_FASTIFY_CONFIG,
} from './fastify/config/fastify.config';

/**
 * Fastify 监控服务
 */
export { HealthCheckService } from './fastify/monitoring/health-check.service';
export type { HealthCheckResult, ComponentHealth } from './fastify/monitoring/health-check.service';
export { PerformanceMonitorService } from './fastify/monitoring/performance-monitor.service';
export type { PerformanceMetrics, RouteMetrics } from './fastify/monitoring/performance-monitor.service';

// ============================================================
// 缓存模块（Phase 3.1）
// ============================================================

/**
 * 缓存模块
 */
export { CachingModule } from './caching/cache.module';
export type { CachingModuleOptions, CachingModuleAsyncOptions } from './caching/cache.module';

/**
 * 缓存服务
 */
export { CacheService } from './caching/cache.service';
export type { ICacheService } from './caching/cache.service';
export { RedisService } from './caching/redis.service';
export type { RedisOptions } from './caching/redis.service';

/**
 * 缓存工具
 */
export { KeyGenerator } from './caching/utils/key-generator.util';
export { Serializer } from './caching/utils/serializer.util';

/**
 * 缓存装饰器
 */
export { Cacheable } from './caching/decorators/cacheable.decorator';
export type { CacheableOptions } from './caching/decorators/cacheable.decorator';
export { CacheEvict } from './caching/decorators/cache-evict.decorator';
export type { CacheEvictOptions } from './caching/decorators/cache-evict.decorator';
export { CachePut } from './caching/decorators/cache-put.decorator';
export type { CachePutOptions } from './caching/decorators/cache-put.decorator';

// ============================================================
// 数据隔离模块（Phase 3.2）
// ============================================================

/**
 * 隔离模块
 */
export { IsolationModule } from './isolation/isolation.module';
export type { IsolationModuleOptions } from './isolation/isolation.module';

/**
 * 隔离服务
 */
export { IsolationContextService } from './isolation/services/isolation-context.service';
export { MultiLevelIsolationService } from './isolation/services/multi-level-isolation.service';
export type { DataAccessContext } from './isolation/services/multi-level-isolation.service';

/**
 * 隔离中间件
 */
export { IsolationExtractionMiddleware } from './isolation/middleware/isolation-extraction.middleware';

/**
 * 隔离装饰器
 */
export { CurrentIsolation } from './isolation/decorators/current-isolation.decorator';

/**
 * 隔离守卫
 */
export { IsolationGuard, REQUIRED_ISOLATION_LEVEL } from './isolation/guards/isolation.guard';

// ============================================================
// 日志模块（Phase 3-4）
// ============================================================

/**
 * 日志模块
 */
export { LoggingModule } from './logging/logger.module';

/**
 * 日志服务
 */
export { LoggerService } from './logging/logger.service';
export type { LoggerOptions, LogLevel } from './logging/logger.service';

// ============================================================
// 配置管理模块（Phase 5）
// ============================================================

/**
 * 配置模块
 */
export { TypedConfigModule } from './configuration/typed-config.module';
export type { TypedConfigModuleOptions, ConfigLoader } from './configuration/typed-config.module';

/**
 * 配置加载器
 */
export { FileLoader, fileLoader } from './configuration/loaders/file.loader';
export type { FileLoaderOptions } from './configuration/loaders/file.loader';
export { DotenvLoader, dotenvLoader } from './configuration/loaders/dotenv.loader';
export type { DotenvLoaderOptions } from './configuration/loaders/dotenv.loader';

// ============================================================
// 版本信息
// ============================================================

export const version = '0.3.0';

