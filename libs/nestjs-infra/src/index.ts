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
export { ExceptionModule } from './exceptions/exception.module.js';

/**
 * 异常类
 */
export { AbstractHttpException } from './exceptions/core/abstract-http.exception.js';
export type { ProblemDetails } from './exceptions/core/abstract-http.exception.js';
export { GeneralNotFoundException } from './exceptions/core/general-not-found.exception.js';
export { GeneralBadRequestException } from './exceptions/core/general-bad-request.exception.js';
export { GeneralInternalServerException } from './exceptions/core/general-internal-server.exception.js';

/**
 * 异常过滤器
 */
export { HttpExceptionFilter } from './exceptions/filters/http-exception.filter.js';
export type { ILoggerService, IExceptionMessageProvider } from './exceptions/filters/http-exception.filter.js';
export { AnyExceptionFilter } from './exceptions/filters/any-exception.filter.js';

/**
 * 消息提供者
 */
export type { ExceptionMessageProvider } from './exceptions/providers/exception-message.provider.js';
export { DefaultMessageProvider } from './exceptions/providers/default-message.provider.js';

/**
 * 异常配置
 */
export { EXCEPTION_MODULE_OPTIONS, DEFAULT_EXCEPTION_OPTIONS } from './exceptions/config/exception.config.js';
export type {
  ExceptionModuleOptions,
  ExceptionModuleAsyncOptions,
  ExceptionOptionsFactory,
} from './exceptions/config/exception.config.js';

// ============================================================
// 从 @hl8/platform 重新导出核心模块
// ============================================================

/**
 * 值对象
 */
export { EntityId, TenantId, OrganizationId, DepartmentId, UserId } from '@hl8/platform';

/**
 * 实体
 */
export { IsolationContext } from '@hl8/platform';

/**
 * 业务异常
 */
export { TenantNotFoundException } from './exceptions/core/tenant-not-found.exception.js';
export { InvalidIsolationContextException } from './exceptions/core/invalid-isolation-context.exception.js';
export { UnauthorizedOrganizationException } from './exceptions/core/unauthorized-organization.exception.js';

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
} from '@hl8/platform';

/**
 * 枚举
 */
export { IsolationLevel, DataSharingLevel } from '@hl8/platform';

// ============================================================
// 通用技术组件
// ============================================================

/**
 * 装饰器
 */
export { Public, IS_PUBLIC_KEY } from './common/decorators/public.decorator.js';

// ============================================================
// Fastify 适配器模块（已移至 @hl8/nestjs-fastify）
// ============================================================
// 注意：Fastify 专用功能现在位于 @hl8/nestjs-fastify 包中
// - EnterpriseFastifyAdapter
// - Fastify 配置
// - Fastify 监控服务

// ============================================================
// 缓存模块（Phase 3.1）
// ============================================================

/**
 * 缓存模块
 */
export { CachingModule } from './caching/cache.module.js';
export type { CachingModuleOptions, CachingModuleAsyncOptions } from './caching/cache.module.js';

/**
 * 缓存服务
 */
export { CacheService } from './caching/cache.service.js';
export type { ICacheService } from './caching/cache.service.js';
export { RedisService } from './caching/redis.service.js';
export type { RedisOptions } from './caching/redis.service.js';

/**
 * 缓存工具
 */
export { KeyGenerator } from './caching/utils/key-generator.util.js';
export { Serializer } from './caching/utils/serializer.util.js';

/**
 * 缓存装饰器
 */
export { Cacheable } from './caching/decorators/cacheable.decorator.js';
export type { CacheableOptions } from './caching/decorators/cacheable.decorator.js';
export { CacheEvict } from './caching/decorators/cache-evict.decorator.js';
export type { CacheEvictOptions } from './caching/decorators/cache-evict.decorator.js';
export { CachePut } from './caching/decorators/cache-put.decorator.js';
export type { CachePutOptions } from './caching/decorators/cache-put.decorator.js';

/**
 * 缓存配置（使用 ConfigValidator）
 */
export { CachingModuleConfig, RedisConfig } from './caching/config/caching.config.js';

// ============================================================
// 数据隔离模块（Phase 3.2）
// ============================================================

/**
 * 隔离模块
 */
export { IsolationModule } from './isolation/isolation.module.js';
export type { IsolationModuleOptions } from './isolation/isolation.module.js';

/**
 * 隔离服务
 */
export { IsolationContextService } from './isolation/services/isolation-context.service.js';
export { MultiLevelIsolationService } from './isolation/services/multi-level-isolation.service.js';
export type { DataAccessContext } from './isolation/services/multi-level-isolation.service.js';

/**
 * 隔离中间件
 */
export { IsolationExtractionMiddleware } from './isolation/middleware/isolation-extraction.middleware.js';

/**
 * 隔离装饰器
 */
export { CurrentIsolation } from './isolation/decorators/current-isolation.decorator.js';

/**
 * 隔离守卫
 */
export { IsolationGuard, REQUIRED_ISOLATION_LEVEL } from './isolation/guards/isolation.guard.js';

// ============================================================
// 日志模块（已移至 @hl8/nestjs-fastify）
// ============================================================
// 注意：日志功能现在由 @hl8/nestjs-fastify/FastifyLoggerService 提供
// - 零开销（复用 Fastify Pino）
// - 自动包含隔离上下文
// - 全局统一服务
//
// 非 HTTP 场景请使用 @nestjs/common/Logger

// ============================================================
// 配置管理模块（Phase 5）
// ============================================================

/**
 * 配置模块
 */
export { TypedConfigModule } from './configuration/typed-config.module.js';
export type { TypedConfigModuleOptions, ConfigLoader } from './configuration/typed-config.module.js';

/**
 * 配置加载器
 */
export { FileLoader, fileLoader } from './configuration/loaders/file.loader.js';
export type { FileLoaderOptions } from './configuration/loaders/file.loader.js';
export { DotenvLoader, dotenvLoader } from './configuration/loaders/dotenv.loader.js';
export type { DotenvLoaderOptions } from './configuration/loaders/dotenv.loader.js';
export { RemoteLoader, remoteLoader } from './configuration/loaders/remote.loader.js';
export type { RemoteLoaderOptions } from './configuration/loaders/remote.loader.js';

/**
 * 配置验证器
 */
export { ConfigValidator } from './configuration/validators/config.validator.js';
export type { ValidateOptions } from './configuration/validators/config.validator.js';

/**
 * 配置缓存
 */
export { ConfigCacheService } from './configuration/cache/config-cache.service.js';

// ============================================================
// 版本信息
// ============================================================

export const version = '0.3.0';

