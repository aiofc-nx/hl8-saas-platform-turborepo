/**
 * 缓存键值对象
 * 
 * @description 封装缓存键的生成逻辑和业务规则
 * 
 * ## 业务规则
 * 
 * ### 键格式规则
 * - 格式: {prefix}:{level}:{namespace}:{key}
 * - level: platform/tenant/org/dept/user
 * - 键长度不超过 256 字符
 * - 不允许包含空格和特殊字符（除 : _ -）
 * 
 * ### 层级规则
 * - 平台级: platform:{namespace}:{key}
 * - 租户级: tenant:{tenantId}:{namespace}:{key}
 * - 组织级: tenant:{tenantId}:org:{orgId}:{namespace}:{key}
 * - 部门级: tenant:{tenantId}:org:{orgId}:dept:{deptId}:{namespace}:{key}
 * - 用户级: user:{userId}:{namespace}:{key}
 * 
 * @example
 * ```typescript
 * // 平台级键
 * const platformKey = CacheKey.forPlatform('system', 'version', 'hl8:cache:');
 * console.log(platformKey.toString()); 
 * // 输出: hl8:cache:platform:system:version
 * 
 * // 租户级键
 * const context = { tenantId: 't123' };
 * const tenantKey = CacheKey.forTenant('config', 'flags', 'hl8:cache:', context);
 * console.log(tenantKey.toString()); 
 * // 输出: hl8:cache:tenant:t123:config:flags
 * 
 * // 自动判断层级
 * const autoKey = CacheKey.fromContext('user', 'profile', 'hl8:cache:', {
 *   tenantId: 't123',
 *   organizationId: 'o456',
 *   departmentId: 'd789',
 * });
 * console.log(autoKey.toString()); 
 * // 输出: hl8:cache:tenant:t123:org:o456:dept:d789:user:profile
 * ```
 * 
 * @since 1.0.0
 */

import { CacheLevel } from '../../types/cache-level.enum.js';
import type { IsolationContext } from '@hl8/isolation-model';

/**
 * 通用错误异常（临时定义，后续会从 nestjs-infra 导入）
 */
class GeneralBadRequestException extends Error {
  constructor(message: string, detail?: string, context?: Record<string, any>) {
    super(detail || message);
    this.name = 'GeneralBadRequestException';
  }
}

/**
 * 缓存键值对象
 * 
 * 值对象特性：
 * - 不可变（所有属性 readonly）
 * - 无副作用
 * - 值语义（基于值比较，而非引用）
 * - 自验证（构造时验证有效性）
 */
export class CacheKey {
  private readonly fullKey: string;
  
  /**
   * 私有构造函数 - 强制使用静态工厂方法创建实例
   * 
   * @param prefix - 键前缀
   * @param level - 缓存层级
   * @param namespace - 命名空间
   * @param key - 原始键名
   * @param isolationContext - 隔离上下文（可选）
   */
  private constructor(
    private readonly prefix: string,
    private readonly level: CacheLevel,
    private readonly namespace: string,
    private readonly key: string,
    private readonly isolationContext?: IsolationContext,
    prebuiltKey?: string,  // 可选：预先构建的键（避免重复计算）
  ) {
    this.fullKey = prebuiltKey || this.buildKey();
    this.validate();
  }
  
  /**
   * 创建平台级缓存键
   * 
   * @description 平台级缓存跨租户共享，用于存储平台范围的配置和数据
   * 
   * @param namespace - 命名空间（如 'system', 'config'）
   * @param key - 缓存键名
   * @param prefix - 键前缀（如 'hl8:cache:'）
   * @returns CacheKey 实例
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forPlatform('system', 'version', 'hl8:cache:');
   * // 生成: hl8:cache:platform:system:version
   * ```
   */
  static forPlatform(namespace: string, key: string, prefix: string): CacheKey {
    return new CacheKey(prefix, CacheLevel.PLATFORM, namespace, key);
  }
  
  /**
   * 创建租户级缓存键
   * 
   * @description 租户级缓存在租户内共享，租户间完全隔离
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param prefix - 键前缀
   * @param context - 隔离上下文（必须包含 tenantId）
   * @returns CacheKey 实例
   * @throws {GeneralBadRequestException} 如果 tenantId 缺失
   * 
   * @example
   * ```typescript
   * const tenantId = TenantId.create('t123');
   * const context = IsolationContext.tenant(tenantId);
   * const key = CacheKey.forTenant('config', 'flags', 'hl8:cache:', context);
   * // 生成: hl8:cache:tenant:t123:config:flags
   * ```
   */
  static forTenant(
    namespace: string, 
    key: string, 
    prefix: string, 
    context: IsolationContext
  ): CacheKey {
    if (!context.tenantId) {
      throw new GeneralBadRequestException(
        '租户 ID 缺失', 
        '租户级缓存需要提供租户 ID'
      );
    }
    
    // 使用 IsolationContext 生成键
    const isolationKey = context.buildCacheKey(namespace, key);
    const fullKey = `${prefix}${isolationKey}`;
    
    return new CacheKey(prefix, CacheLevel.TENANT, namespace, key, context, fullKey);
  }
  
  /**
   * 创建组织级缓存键
   * 
   * @description 组织级缓存在组织内共享，组织间隔离
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param prefix - 键前缀
   * @param context - 隔离上下文（必须包含 tenantId + organizationId）
   * @returns CacheKey 实例
   * @throws {GeneralBadRequestException} 如果必需的标识符缺失
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forOrganization('members', 'list', 'hl8:cache:', {
   *   tenantId: 't123',
   *   organizationId: 'o456',
   * });
   * // 生成: hl8:cache:tenant:t123:org:o456:members:list
   * ```
   */
  static forOrganization(
    namespace: string, 
    key: string, 
    prefix: string, 
    context: IsolationContext
  ): CacheKey {
    if (!context.tenantId || !context.organizationId) {
      throw new GeneralBadRequestException(
        '组织级缓存需要租户 ID 和组织 ID',
        '请确保隔离上下文包含完整信息'
      );
    }
    
    // 使用 IsolationContext 生成键
    const isolationKey = context.buildCacheKey(namespace, key);
    const fullKey = `${prefix}${isolationKey}`;
    
    return new CacheKey(prefix, CacheLevel.ORGANIZATION, namespace, key, context, fullKey);
  }
  
  /**
   * 创建部门级缓存键
   * 
   * @description 部门级缓存在部门内共享，部门间隔离
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param prefix - 键前缀
   * @param context - 隔离上下文（必须包含 tenantId + organizationId + departmentId）
   * @returns CacheKey 实例
   * @throws {GeneralBadRequestException} 如果必需的标识符缺失
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forDepartment('tasks', 'active', 'hl8:cache:', {
   *   tenantId: 't123',
   *   organizationId: 'o456',
   *   departmentId: 'd789',
   * });
   * // 生成: hl8:cache:tenant:t123:org:o456:dept:d789:tasks:active
   * ```
   */
  static forDepartment(
    namespace: string, 
    key: string, 
    prefix: string, 
    context: IsolationContext
  ): CacheKey {
    if (!context.tenantId || !context.organizationId || !context.departmentId) {
      throw new GeneralBadRequestException(
        '部门级缓存需要租户 ID、组织 ID 和部门 ID',
        '请确保隔离上下文包含完整信息'
      );
    }
    
    // 使用 IsolationContext 生成键
    const isolationKey = context.buildCacheKey(namespace, key);
    const fullKey = `${prefix}${isolationKey}`;
    
    return new CacheKey(prefix, CacheLevel.DEPARTMENT, namespace, key, context, fullKey);
  }
  
  /**
   * 创建用户级缓存键
   * 
   * @description 用户级缓存为用户私有，仅该用户可访问
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param prefix - 键前缀
   * @param context - 隔离上下文（必须包含 userId）
   * @returns CacheKey 实例
   * @throws {GeneralBadRequestException} 如果 userId 缺失
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forUser('preferences', 'theme', 'hl8:cache:', {
   *   userId: 'u999',
   * });
   * // 生成: hl8:cache:user:u999:preferences:theme
   * ```
   */
  static forUser(
    namespace: string, 
    key: string, 
    prefix: string, 
    context: IsolationContext
  ): CacheKey {
    if (!context.userId) {
      throw new GeneralBadRequestException(
        '用户 ID 缺失', 
        '用户级缓存需要提供用户 ID'
      );
    }
    
    // 使用 IsolationContext 生成键
    const isolationKey = context.buildCacheKey(namespace, key);
    const fullKey = `${prefix}${isolationKey}`;
    
    return new CacheKey(prefix, CacheLevel.USER, namespace, key, context, fullKey);
  }
  
  /**
   * 根据隔离上下文自动创建缓存键
   * 
   * @description 自动判断隔离层级并创建相应的缓存键
   * 
   * ## 层级判断规则
   * 
   * 1. 如果有 departmentId → 部门级
   * 2. 如果有 organizationId → 组织级
   * 3. 如果有 tenantId → 租户级
   * 4. 如果有 userId（且无租户信息）→ 用户级
   * 5. 默认 → 平台级
   * 
   * @param namespace - 命名空间
   * @param key - 缓存键名
   * @param prefix - 键前缀
   * @param context - 隔离上下文
   * @returns CacheKey 实例
   * 
   * @example
   * ```typescript
   * // 根据上下文自动判断层级
   * const key = CacheKey.fromContext('data', 'list', 'hl8:cache:', {
   *   tenantId: 't123',
   *   organizationId: 'o456',
   * });
   * // 自动判断为组织级，生成: hl8:cache:tenant:t123:org:o456:data:list
   * ```
   */
  static fromContext(
    namespace: string, 
    key: string, 
    prefix: string, 
    context: IsolationContext
  ): CacheKey {
    // 委托给领域模型生成键（业务逻辑封装在 IsolationContext 内部）
    const isolationKey = context.buildCacheKey(namespace, key);
    const fullKey = `${prefix}${isolationKey}`;
    const level = this.mapIsolationLevelToCacheLevel(context.getIsolationLevel());
    
    return new CacheKey(prefix, level, namespace, key, context, fullKey);
  }
  
  /**
   * 映射 IsolationLevel 到 CacheLevel
   * 
   * @private
   */
  private static mapIsolationLevelToCacheLevel(isolationLevel: string): CacheLevel {
    switch (isolationLevel) {
      case 'platform': return CacheLevel.PLATFORM;
      case 'tenant': return CacheLevel.TENANT;
      case 'organization': return CacheLevel.ORGANIZATION;
      case 'department': return CacheLevel.DEPARTMENT;
      case 'user': return CacheLevel.USER;
      default: return CacheLevel.PLATFORM;
    }
  }
  
  /**
   * 构建完整的缓存键
   * 
   * @description 仅用于 forPlatform()，其他方法使用 IsolationContext.buildCacheKey()
   * 
   * @returns 完整的缓存键字符串
   * @private
   */
  private buildKey(): string {
    // 平台级不需要隔离上下文
    if (this.level === CacheLevel.PLATFORM) {
      return `${this.prefix}platform:${this.namespace}:${this.key}`;
    }
    
    // 其他级别应该通过 prebuiltKey 参数传入，不应该走到这里
    throw new Error('其他级别的缓存键应该通过 IsolationContext.buildCacheKey() 生成');
  }
  
  /**
   * 验证缓存键的有效性
   * 
   * @throws {GeneralBadRequestException} 键无效
   * @private
   */
  private validate(): void {
    // 验证长度
    if (this.fullKey.length > 256) {
      throw new GeneralBadRequestException(
        '缓存键过长',
        `缓存键长度不能超过 256 字符，当前长度: ${this.fullKey.length}`,
        { key: this.fullKey }
      );
    }
    
    // 验证字符
    const invalidChars = /[^\w:_-]/;
    if (invalidChars.test(this.fullKey)) {
      throw new GeneralBadRequestException(
        '缓存键包含无效字符',
        '缓存键只能包含字母、数字、冒号、下划线和连字符',
        { key: this.fullKey }
      );
    }
  }
  
  /**
   * 获取完整的缓存键
   * 
   * @returns 完整的缓存键字符串
   */
  toString(): string {
    return this.fullKey;
  }
  
  /**
   * 获取缓存层级
   * 
   * @returns 缓存层级枚举
   */
  getLevel(): CacheLevel {
    return this.level;
  }
  
  /**
   * 生成匹配模式（用于批量删除）
   * 
   * @returns 匹配模式字符串（添加通配符 *）
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forTenant('user', 'profile', 'hl8:cache:', { 
   *   tenantId: 't123' 
   * });
   * console.log(key.toPattern()); 
   * // 输出: hl8:cache:tenant:t123:user:profile*
   * ```
   */
  toPattern(): string {
    return `${this.fullKey}*`;
  }
  
  /**
   * 值对象相等性比较
   * 
   * @description 基于值比较，而非引用比较
   * 
   * @param other - 另一个 CacheKey 实例
   * @returns 如果键相同返回 true，否则返回 false
   * 
   * @example
   * ```typescript
   * const key1 = CacheKey.forPlatform('system', 'version', 'hl8:cache:');
   * const key2 = CacheKey.forPlatform('system', 'version', 'hl8:cache:');
   * console.log(key1.equals(key2)); // true
   * console.log(key1 === key2); // false (不同的对象引用)
   * ```
   */
  equals(other: CacheKey): boolean {
    return this.fullKey === other.fullKey;
  }
}

