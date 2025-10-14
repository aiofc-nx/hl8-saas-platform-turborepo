/**
 * 隔离上下文类型
 *
 * @description 从 @hl8/isolation-model 导入的隔离上下文定义
 *
 * ## 使用说明
 *
 * 隔离上下文是纯领域模型，封装了多层级隔离的业务逻辑：
 * - 包含租户、组织、部门、用户等标识符
 * - 提供 buildCacheKey() 方法生成缓存键
 * - 提供 getIsolationLevel() 判断隔离层级
 * - 零依赖，框架无关
 *
 * CacheKey 会调用 IsolationContext 的方法自动生成正确的缓存键。
 *
 * @example
 * ```typescript
 * import { IsolationContext, TenantId } from '@hl8/isolation-model';
 *
 * const context = IsolationContext.tenant(TenantId.create('t123'));
 *
 * // CacheKey 使用领域模型生成键
 * const cacheKey = context.buildCacheKey('user', 'profile');
 * // 返回: tenant:t123:user:profile
 * ```
 *
 * @since 1.0.0
 */
export type { IsolationContext } from '@hl8/isolation-model';
