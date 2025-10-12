/**
 * 数据隔离级别枚举
 *
 * @description 定义多层级数据隔离的级别
 *
 * ## 业务规则
 *
 * ### 隔离级别层次
 * - PLATFORM：平台级（最高级别，所有租户共享）
 * - TENANT：租户级（租户内所有数据）
 * - ORGANIZATION：组织级（租户内的组织）
 * - DEPARTMENT：部门级（组织内的部门）
 * - USER：用户级（个人数据，最细粒度）
 *
 * ### 数据可见性
 * - 上级可以访问下级数据
 * - 下级不能访问上级非共享数据
 * - 同级之间默认不可见
 *
 * @example
 * ```typescript
 * // 判断数据隔离级别
 * if (data.isolationLevel === IsolationLevel.TENANT) {
 *   // 租户级数据，租户内所有用户可见
 * }
 *
 * // 设置隔离上下文
 * const context = {
 *   level: IsolationLevel.ORGANIZATION,
 *   organizationId: 'org-123',
 * };
 * ```
 *
 * @since 0.1.0
 */

/**
 * 数据隔离级别
 *
 * @description 定义数据隔离的层次结构
 */
export enum IsolationLevel {
  /**
   * 平台级
   *
   * @description 平台级数据，所有租户共享
   * @example 平台公告、系统配置、平台活动
   */
  PLATFORM = 'PLATFORM',

  /**
   * 租户级
   *
   * @description 租户级数据，租户内所有用户可见
   * @example 租户配置、租户公告、租户统计
   */
  TENANT = 'TENANT',

  /**
   * 组织级
   *
   * @description 组织级数据，组织内所有用户可见
   * @example 组织公告、组织项目、组织资源
   */
  ORGANIZATION = 'ORGANIZATION',

  /**
   * 部门级
   *
   * @description 部门级数据，部门内所有用户可见
   * @example 部门文档、部门任务、部门资源
   */
  DEPARTMENT = 'DEPARTMENT',

  /**
   * 用户级
   *
   * @description 用户级数据，仅用户本人可见
   * @example 个人设置、个人任务、个人文件
   */
  USER = 'USER',
}

/**
 * 获取隔离级别的显示名称
 *
 * @param level - 隔离级别
 * @returns 显示名称
 *
 * @example
 * ```typescript
 * getIsolationLevelName(IsolationLevel.TENANT); // "租户级"
 * ```
 */
export function getIsolationLevelName(level: IsolationLevel): string {
  const names: Record<IsolationLevel, string> = {
    [IsolationLevel.PLATFORM]: '平台级',
    [IsolationLevel.TENANT]: '租户级',
    [IsolationLevel.ORGANIZATION]: '组织级',
    [IsolationLevel.DEPARTMENT]: '部门级',
    [IsolationLevel.USER]: '用户级',
  };
  return names[level];
}

/**
 * 获取隔离级别的优先级（数字越大级别越高）
 *
 * @param level - 隔离级别
 * @returns 优先级数值
 *
 * @example
 * ```typescript
 * getIsolationLevelPriority(IsolationLevel.PLATFORM); // 5
 * getIsolationLevelPriority(IsolationLevel.USER); // 1
 * ```
 */
export function getIsolationLevelPriority(level: IsolationLevel): number {
  const priorities: Record<IsolationLevel, number> = {
    [IsolationLevel.PLATFORM]: 5,
    [IsolationLevel.TENANT]: 4,
    [IsolationLevel.ORGANIZATION]: 3,
    [IsolationLevel.DEPARTMENT]: 2,
    [IsolationLevel.USER]: 1,
  };
  return priorities[level];
}

/**
 * 比较两个隔离级别
 *
 * @param level1 - 隔离级别1
 * @param level2 - 隔离级别2
 * @returns 如果 level1 >= level2 则返回 true
 *
 * @example
 * ```typescript
 * isHigherOrEqualLevel(IsolationLevel.TENANT, IsolationLevel.USER); // true
 * isHigherOrEqualLevel(IsolationLevel.USER, IsolationLevel.TENANT); // false
 * ```
 */
export function isHigherOrEqualLevel(
  level1: IsolationLevel,
  level2: IsolationLevel,
): boolean {
  return (
    getIsolationLevelPriority(level1) >= getIsolationLevelPriority(level2)
  );
}

