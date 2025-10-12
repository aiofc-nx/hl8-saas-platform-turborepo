/**
 * 缓存层级枚举
 * 
 * @description 定义缓存的 5 个隔离层级
 * 
 * ## 层级说明
 * 
 * - PLATFORM: 平台级缓存，跨租户共享
 * - TENANT: 租户级缓存，租户内共享
 * - ORGANIZATION: 组织级缓存，组织内共享
 * - DEPARTMENT: 部门级缓存，部门内共享
 * - USER: 用户级缓存，用户私有
 * 
 * ## 使用示例
 * 
 * ```typescript
 * // 判断缓存层级
 * if (key.getLevel() === CacheLevel.TENANT) {
 *   console.log('这是租户级缓存');
 * }
 * 
 * // 根据层级生成键
 * switch (level) {
 *   case CacheLevel.PLATFORM:
 *     return CacheKey.forPlatform(namespace, key, prefix);
 *   case CacheLevel.TENANT:
 *     return CacheKey.forTenant(namespace, key, prefix, context);
 *   // ... 其他层级
 * }
 * ```
 * 
 * @since 1.0.0
 */
export enum CacheLevel {
  /** 平台级缓存 */
  PLATFORM = 'platform',
  
  /** 租户级缓存 */
  TENANT = 'tenant',
  
  /** 组织级缓存 */
  ORGANIZATION = 'organization',
  
  /** 部门级缓存 */
  DEPARTMENT = 'department',
  
  /** 用户级缓存 */
  USER = 'user',
}

