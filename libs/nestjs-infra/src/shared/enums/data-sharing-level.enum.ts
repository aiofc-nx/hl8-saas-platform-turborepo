/**
 * 数据共享级别枚举
 *
 * @description 定义数据在不同层级间的共享范围
 *
 * ## 业务规则
 *
 * ### 共享级别规则
 * - PRIVATE：私有数据，仅创建者或指定用户可见
 * - DEPARTMENT：部门共享，部门内所有成员可见
 * - ORGANIZATION：组织共享，组织内所有成员可见
 * - TENANT：租户共享，租户内所有用户可见
 * - PLATFORM：平台共享，所有租户可见
 *
 * ### 共享优先级
 * - PLATFORM > TENANT > ORGANIZATION > DEPARTMENT > PRIVATE
 * - 高级别共享包含低级别的访问权限
 *
 * @example
 * ```typescript
 * // 设置数据共享级别
 * const announcement = {
 *   title: '重要通知',
 *   isShared: true,
 *   sharingLevel: DataSharingLevel.ORGANIZATION,
 *   sharedWith: ['org-123'],
 * };
 *
 * // 检查共享级别
 * if (data.sharingLevel === DataSharingLevel.PLATFORM) {
 *   // 平台级共享数据，所有用户可见
 * }
 * ```
 *
 * @since 0.1.0
 */

/**
 * 数据共享级别
 *
 * @description 定义数据的共享范围
 */
export enum DataSharingLevel {
  /**
   * 私有
   *
   * @description 仅创建者或指定用户可访问
   * @example 个人笔记、私密文件
   */
  PRIVATE = 'PRIVATE',

  /**
   * 部门共享
   *
   * @description 部门内所有成员可访问
   * @example 部门文档、部门任务
   */
  DEPARTMENT = 'DEPARTMENT',

  /**
   * 组织共享
   *
   * @description 组织内所有成员可访问
   * @example 组织公告、组织资源
   */
  ORGANIZATION = 'ORGANIZATION',

  /**
   * 租户共享
   *
   * @description 租户内所有用户可访问
   * @example 租户公告、租户政策
   */
  TENANT = 'TENANT',

  /**
   * 平台共享
   *
   * @description 平台内所有租户可访问
   * @example 平台公告、营运活动
   */
  PLATFORM = 'PLATFORM',
}

/**
 * 获取共享级别的显示名称
 *
 * @param level - 共享级别
 * @returns 显示名称
 *
 * @example
 * ```typescript
 * getSharingLevelName(DataSharingLevel.ORGANIZATION); // "组织共享"
 * ```
 */
export function getSharingLevelName(level: DataSharingLevel): string {
  const names: Record<DataSharingLevel, string> = {
    [DataSharingLevel.PRIVATE]: '私有',
    [DataSharingLevel.DEPARTMENT]: '部门共享',
    [DataSharingLevel.ORGANIZATION]: '组织共享',
    [DataSharingLevel.TENANT]: '租户共享',
    [DataSharingLevel.PLATFORM]: '平台共享',
  };
  return names[level];
}

/**
 * 获取共享级别的优先级（数字越大共享范围越广）
 *
 * @param level - 共享级别
 * @returns 优先级数值
 *
 * @example
 * ```typescript
 * getSharingLevelPriority(DataSharingLevel.PLATFORM); // 5
 * getSharingLevelPriority(DataSharingLevel.PRIVATE); // 1
 * ```
 */
export function getSharingLevelPriority(level: DataSharingLevel): number {
  const priorities: Record<DataSharingLevel, number> = {
    [DataSharingLevel.PLATFORM]: 5,
    [DataSharingLevel.TENANT]: 4,
    [DataSharingLevel.ORGANIZATION]: 3,
    [DataSharingLevel.DEPARTMENT]: 2,
    [DataSharingLevel.PRIVATE]: 1,
  };
  return priorities[level];
}

/**
 * 比较两个共享级别
 *
 * @param level1 - 共享级别1
 * @param level2 - 共享级别2
 * @returns 如果 level1 的共享范围 >= level2 则返回 true
 *
 * @example
 * ```typescript
 * isWiderOrEqualSharing(DataSharingLevel.TENANT, DataSharingLevel.DEPARTMENT); // true
 * isWiderOrEqualSharing(DataSharingLevel.PRIVATE, DataSharingLevel.ORGANIZATION); // false
 * ```
 */
export function isWiderOrEqualSharing(
  level1: DataSharingLevel,
  level2: DataSharingLevel,
): boolean {
  return (
    getSharingLevelPriority(level1) >= getSharingLevelPriority(level2)
  );
}

