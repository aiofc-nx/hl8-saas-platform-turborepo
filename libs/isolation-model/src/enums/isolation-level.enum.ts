/**
 * 隔离级别枚举
 *
 * @description 定义 5 个数据隔离层级
 *
 * ## 层级说明
 *
 * - PLATFORM: 平台级 - 跨租户，所有数据
 * - TENANT: 租户级 - 租户内数据
 * - ORGANIZATION: 组织级 - 组织内数据
 * - DEPARTMENT: 部门级 - 部门内数据
 * - USER: 用户级 - 用户私有数据
 *
 * ## 层级优先级
 *
 * PLATFORM（最高权限）> TENANT > ORGANIZATION > DEPARTMENT > USER（最低权限）
 *
 * @example
 * ```typescript
 * const level = context.getIsolationLevel();
 *
 * switch (level) {
 *   case IsolationLevel.TENANT:
 *     console.log('租户级隔离');
 *     break;
 *   // ...
 * }
 * ```
 *
 * @since 1.0.0
 */
export enum IsolationLevel {
  /** 平台级 - 跨租户 */
  PLATFORM = 'platform',

  /** 租户级 - 租户内 */
  TENANT = 'tenant',

  /** 组织级 - 组织内 */
  ORGANIZATION = 'organization',

  /** 部门级 - 部门内 */
  DEPARTMENT = 'department',

  /** 用户级 - 用户私有 */
  USER = 'user',
}
