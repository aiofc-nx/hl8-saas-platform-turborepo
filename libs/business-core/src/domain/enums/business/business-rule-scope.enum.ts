/**
 * 业务规则作用域枚举
 *
 * @description 定义系统中所有业务规则作用域的枚举值
 *
 * ## 业务规则
 *
 * ### 业务规则作用域规则
 * - 字段级规则：字段级别的验证规则
 * - 实体级规则：实体级别的验证规则
 * - 聚合级规则：聚合级别的验证规则
 * - 跨聚合规则：跨聚合的验证规则
 * - 系统级规则：系统级别的验证规则
 *
 * ### 业务规则作用域层级规则
 * - 系统级规则：最高级别，影响整个系统
 * - 跨聚合规则：影响多个聚合
 * - 聚合级规则：影响单个聚合
 * - 实体级规则：影响单个实体
 * - 字段级规则：影响单个字段
 *
 * @example
 * ```typescript
 * import { BusinessRuleScope } from './business-rule-scope.enum.js';
 *
 * // 检查规则作用域
 * console.log(BusinessRuleScope.SYSTEM); // "system"
 * console.log(BusinessRuleScopeUtils.isSystemScope(BusinessRuleScope.SYSTEM)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum BusinessRuleScope {
  /** 字段级规则 */
  FIELD = "field",
  /** 实体级规则 */
  ENTITY = "entity",
  /** 聚合级规则 */
  AGGREGATE = "aggregate",
  /** 跨聚合规则 */
  CROSS_AGGREGATE = "cross_aggregate",
  /** 系统级规则 */
  SYSTEM = "system",
}

/**
 * 业务规则作用域工具类
 *
 * @description 提供业务规则作用域相关的工具方法
 */
export class BusinessRuleScopeUtils {
  /**
   * 作用域层级映射
   */
  private static readonly SCOPE_HIERARCHY: Record<BusinessRuleScope, number> = {
    [BusinessRuleScope.SYSTEM]: 5,
    [BusinessRuleScope.CROSS_AGGREGATE]: 4,
    [BusinessRuleScope.AGGREGATE]: 3,
    [BusinessRuleScope.ENTITY]: 2,
    [BusinessRuleScope.FIELD]: 1,
  };

  /**
   * 作用域描述映射
   */
  private static readonly SCOPE_DESCRIPTIONS: Record<BusinessRuleScope, string> = {
    [BusinessRuleScope.FIELD]: "字段级规则",
    [BusinessRuleScope.ENTITY]: "实体级规则",
    [BusinessRuleScope.AGGREGATE]: "聚合级规则",
    [BusinessRuleScope.CROSS_AGGREGATE]: "跨聚合规则",
    [BusinessRuleScope.SYSTEM]: "系统级规则",
  };

  /**
   * 检查是否为字段级规则
   *
   * @param scope - 业务规则作用域
   * @returns 是否为字段级规则
   * @example
   * ```typescript
   * const isField = BusinessRuleScopeUtils.isFieldScope(BusinessRuleScope.FIELD);
   * console.log(isField); // true
   * ```
   */
  static isFieldScope(scope: BusinessRuleScope): boolean {
    return scope === BusinessRuleScope.FIELD;
  }

  /**
   * 检查是否为实体级规则
   *
   * @param scope - 业务规则作用域
   * @returns 是否为实体级规则
   */
  static isEntityScope(scope: BusinessRuleScope): boolean {
    return scope === BusinessRuleScope.ENTITY;
  }

  /**
   * 检查是否为聚合级规则
   *
   * @param scope - 业务规则作用域
   * @returns 是否为聚合级规则
   */
  static isAggregateScope(scope: BusinessRuleScope): boolean {
    return scope === BusinessRuleScope.AGGREGATE;
  }

  /**
   * 检查是否为跨聚合规则
   *
   * @param scope - 业务规则作用域
   * @returns 是否为跨聚合规则
   */
  static isCrossAggregateScope(scope: BusinessRuleScope): boolean {
    return scope === BusinessRuleScope.CROSS_AGGREGATE;
  }

  /**
   * 检查是否为系统级规则
   *
   * @param scope - 业务规则作用域
   * @returns 是否为系统级规则
   */
  static isSystemScope(scope: BusinessRuleScope): boolean {
    return scope === BusinessRuleScope.SYSTEM;
  }

  /**
   * 检查业务规则作用域是否高于指定作用域
   *
   * @param scope1 - 作用域1
   * @param scope2 - 作用域2
   * @returns 作用域1是否高于作用域2
   */
  static hasHigherScope(scope1: BusinessRuleScope, scope2: BusinessRuleScope): boolean {
    return this.SCOPE_HIERARCHY[scope1] > this.SCOPE_HIERARCHY[scope2];
  }

  /**
   * 检查业务规则作用域是否等于或高于指定作用域
   *
   * @param scope1 - 作用域1
   * @param scope2 - 作用域2
   * @returns 作用域1是否等于或高于作用域2
   */
  static hasScopeOrHigher(scope1: BusinessRuleScope, scope2: BusinessRuleScope): boolean {
    return this.SCOPE_HIERARCHY[scope1] >= this.SCOPE_HIERARCHY[scope2];
  }

  /**
   * 获取作用域描述
   *
   * @param scope - 业务规则作用域
   * @returns 作用域描述
   */
  static getDescription(scope: BusinessRuleScope): string {
    return this.SCOPE_DESCRIPTIONS[scope] || "未知业务规则作用域";
  }

  /**
   * 获取所有作用域
   *
   * @returns 所有作用域数组
   */
  static getAllScopes(): BusinessRuleScope[] {
    return Object.values(BusinessRuleScope);
  }

  /**
   * 获取管理作用域（系统、跨聚合、聚合）
   *
   * @returns 管理作用域数组
   */
  static getManagementScopes(): BusinessRuleScope[] {
    return [
      BusinessRuleScope.SYSTEM,
      BusinessRuleScope.CROSS_AGGREGATE,
      BusinessRuleScope.AGGREGATE,
    ];
  }
}
