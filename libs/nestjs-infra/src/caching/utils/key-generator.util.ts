/**
 * 缓存键生成器
 *
 * @description 生成支持5层级隔离的缓存键
 *
 * ## 键格式
 * - 平台级: `hl8:cache:platform:{namespace}:{key}`
 * - 租户级: `hl8:cache:tenant:{tenantId}:{namespace}:{key}`
 * - 组织级: `hl8:cache:org:{tenantId}:{orgId}:{namespace}:{key}`
 * - 部门级: `hl8:cache:dept:{tenantId}:{orgId}:{deptId}:{namespace}:{key}`
 * - 用户级: `hl8:cache:user:{tenantId}:{orgId}:{deptId}:{userId}:{namespace}:{key}`
 *
 * @since 0.2.0
 */

import { IsolationLevel } from '@hl8/platform';

/**
 * 隔离上下文（简化版）
 */
export interface IsolationContext {
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
}

/**
 * 缓存键生成器
 */
export class KeyGenerator {
  private static readonly PREFIX = 'hl8:cache';

  /**
   * 生成缓存键
   *
   * @param namespace - 命名空间
   * @param key - 键名
   * @param context - 隔离上下文
   * @returns 完整的缓存键
   *
   * @example
   * ```typescript
   * const key = KeyGenerator.generate('user', '123', {
   *   tenantId: 'tenant-1',
   *   organizationId: 'org-1',
   * });
   * // 返回: hl8:cache:org:tenant-1:org-1:user:123
   * ```
   */
  static generate(
    namespace: string,
    key: string,
    context?: IsolationContext,
  ): string {
    const level = this.determineLevel(context);

    switch (level) {
      case IsolationLevel.PLATFORM:
        return `${this.PREFIX}:platform:${namespace}:${key}`;

      case IsolationLevel.TENANT:
        return `${this.PREFIX}:tenant:${context!.tenantId}:${namespace}:${key}`;

      case IsolationLevel.ORGANIZATION:
        return `${this.PREFIX}:org:${context!.tenantId}:${context!.organizationId}:${namespace}:${key}`;

      case IsolationLevel.DEPARTMENT:
        return `${this.PREFIX}:dept:${context!.tenantId}:${context!.organizationId}:${context!.departmentId}:${namespace}:${key}`;

      case IsolationLevel.USER:
        return `${this.PREFIX}:user:${context!.tenantId}:${context!.organizationId}:${context!.departmentId}:${context!.userId}:${namespace}:${key}`;

      default:
        return `${this.PREFIX}:platform:${namespace}:${key}`;
    }
  }

  /**
   * 确定隔离级别
   *
   * @param context - 隔离上下文
   * @returns 隔离级别
   * @private
   */
  private static determineLevel(context?: IsolationContext): IsolationLevel {
    if (!context) {
      return IsolationLevel.PLATFORM;
    }

    if (context.userId) {
      return IsolationLevel.USER;
    }
    if (context.departmentId) {
      return IsolationLevel.DEPARTMENT;
    }
    if (context.organizationId) {
      return IsolationLevel.ORGANIZATION;
    }
    if (context.tenantId) {
      return IsolationLevel.TENANT;
    }

    return IsolationLevel.PLATFORM;
  }
}

