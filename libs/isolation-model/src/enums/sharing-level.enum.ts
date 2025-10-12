/**
 * 共享级别枚举
 * 
 * @description 定义数据的共享范围
 * 
 * ## 共享级别说明
 * 
 * - PLATFORM: 平台共享 - 所有租户可访问
 * - TENANT: 租户共享 - 租户内所有用户可访问
 * - ORGANIZATION: 组织共享 - 组织内所有用户可访问
 * - DEPARTMENT: 部门共享 - 部门内所有用户可访问
 * - USER: 用户私有 - 仅用户本人可访问
 * 
 * ## 共享规则
 * 
 * - 上级共享数据对下级可见（如租户共享数据对所有组织、部门可见）
 * - 下级数据对上级不可见（除非明确授权）
 * - 同级非共享数据相互隔离
 * 
 * @example
 * ```typescript
 * const canAccess = userContext.canAccess(
 *   dataContext,
 *   true,  // 共享数据
 *   SharingLevel.ORGANIZATION
 * );
 * ```
 * 
 * @since 1.0.0
 */
export enum SharingLevel {
  /** 平台共享 - 所有租户可访问 */
  PLATFORM = 'platform',
  
  /** 租户共享 - 租户内所有用户可访问 */
  TENANT = 'tenant',
  
  /** 组织共享 - 组织内所有用户可访问 */
  ORGANIZATION = 'organization',
  
  /** 部门共享 - 部门内所有用户可访问 */
  DEPARTMENT = 'department',
  
  /** 用户私有 - 仅用户本人可访问 */
  USER = 'user',
}

