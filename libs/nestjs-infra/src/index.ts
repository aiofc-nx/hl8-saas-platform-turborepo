/**
 * @hl8/nestjs-infra - NestJS 基础设施模块
 *
 * @description 此包已被拆分为多个独立的库，请根据需要安装对应的包：
 *
 * ## 已拆分的模块
 *
 * ### 异常处理
 * - **包名**: `@hl8/nestjs-exceptions`
 * - **功能**: 统一异常处理、RFC7807 标准、异常过滤器
 * - **安装**: `pnpm add @hl8/nestjs-exceptions`
 *
 * ### 缓存模块
 * - **包名**: `@hl8/nestjs-caching`
 * - **功能**: Redis 缓存、缓存装饰器、缓存策略
 * - **安装**: `pnpm add @hl8/nestjs-caching`
 *
 * ### 数据隔离
 * - **包名**: `@hl8/nestjs-isolation`
 * - **功能**: 5 层级数据隔离、隔离上下文、隔离守卫
 * - **安装**: `pnpm add @hl8/nestjs-isolation`
 *
 * ### 隔离模型
 * - **包名**: `@hl8/isolation-model`
 * - **功能**: 纯领域模型、值对象、实体
 * - **安装**: `pnpm add @hl8/isolation-model`
 *
 * ### Fastify 适配器
 * - **包名**: `@hl8/nestjs-fastify`
 * - **功能**: 企业级 Fastify 适配器、日志、监控
 * - **安装**: `pnpm add @hl8/nestjs-fastify`
 *
 * ### 配置管理
 * - **包名**: `@hl8/config`
 * - **功能**: 类型安全的配置管理
 * - **安装**: `pnpm add @hl8/config`
 *
 * @packageDocumentation
 * @author HL8 Team
 * @since 0.1.0
 * @deprecated 此包已拆分，请使用上述独立包
 */

// ============================================================
// 通用技术组件（保留）
// ============================================================

/**
 * 装饰器
 */
export { Public, IS_PUBLIC_KEY } from './common/decorators/public.decorator.js';

// ============================================================
// 迁移指南
// ============================================================

/**
 * @deprecated 请使用 @hl8/nestjs-exceptions
 *
 * @example
 * ```typescript
 * // 旧的导入方式
 * import { ExceptionModule } from '@hl8/nestjs-infra';
 *
 * // 新的导入方式
 * import { ExceptionModule } from '@hl8/nestjs-exceptions';
 * ```
 */

/**
 * @deprecated 请使用 @hl8/nestjs-caching
 *
 * @example
 * ```typescript
 * // 旧的导入方式
 * import { CachingModule, Cacheable } from '@hl8/nestjs-infra';
 *
 * // 新的导入方式
 * import { CachingModule, Cacheable } from '@hl8/nestjs-caching';
 * ```
 */

/**
 * @deprecated 请使用 @hl8/nestjs-isolation
 *
 * @example
 * ```typescript
 * // 旧的导入方式
 * import { IsolationModule, IsolationGuard } from '@hl8/nestjs-infra';
 *
 * // 新的导入方式
 * import { IsolationModule, IsolationGuard } from '@hl8/nestjs-isolation';
 * ```
 */

/**
 * @deprecated 请使用 @hl8/isolation-model
 *
 * @example
 * ```typescript
 * // 旧的导入方式
 * import { IsolationContext, TenantId } from '@hl8/nestjs-infra';
 *
 * // 新的导入方式
 * import { IsolationContext, TenantId } from '@hl8/isolation-model';
 * ```
 */

// ============================================================
// 版本信息
// ============================================================

/**
 * 库版本
 *
 * @deprecated 此包已被拆分，请使用独立的包
 */
export const version = '0.4.0-deprecated';
