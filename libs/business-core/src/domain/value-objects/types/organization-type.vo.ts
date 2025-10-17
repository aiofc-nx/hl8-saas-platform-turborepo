import { BaseValueObject } from "../base-value-object.js";

/**
 * 组织类型值对象
 *
 * @description 定义组织类型的枚举和业务规则，支持多种组织类型的管理。
 * 组织类型决定了组织的功能范围、权限级别和业务规则。
 *
 * ## 业务规则
 *
 * ### 组织类型定义
 * - 委员会：决策型组织，负责重大决策和战略规划
 * - 项目组：执行型组织，负责具体项目执行和交付
 * - 质量组：质量型组织，负责质量管理和标准制定
 * - 绩效组：绩效型组织，负责绩效评估和激励管理
 *
 * ### 类型转换规则
 * - 组织类型在创建后可以变更
 * - 类型变更需要相应的权限验证
 * - 类型变更会影响组织的功能范围
 * - 类型变更需要通知相关用户
 *
 * ### 权限规则
 * - 不同组织类型具有不同的默认权限
 * - 委员会类型具有最高权限级别
 * - 项目组类型具有执行权限
 * - 质量组和绩效组具有专业权限
 *
 * @example
 * ```typescript
 * // 创建委员会类型
 * const committeeType = OrganizationType.create("COMMITTEE");
 * console.log(committeeType.value); // "COMMITTEE"
 *
 * // 验证组织类型
 * const isValid = OrganizationType.isValid("COMMITTEE");
 * console.log(isValid); // true
 *
 * // 获取所有类型
 * const allTypes = OrganizationType.getAllTypes();
 * console.log(allTypes); // ["COMMITTEE", "PROJECT_TEAM", "QUALITY_GROUP", "PERFORMANCE_GROUP"]
 * ```
 *
 * @since 1.0.0
 */
export class OrganizationType extends BaseValueObject<string> {
  /** 委员会 - 决策型组织 */
  static readonly COMMITTEE = "COMMITTEE";

  /** 项目组 - 执行型组织 */
  static readonly PROJECT_TEAM = "PROJECT_TEAM";

  /** 质量组 - 质量型组织 */
  static readonly QUALITY_GROUP = "QUALITY_GROUP";

  /** 绩效组 - 绩效型组织 */
  static readonly PERFORMANCE_GROUP = "PERFORMANCE_GROUP";

  /**
   * 验证组织类型
   *
   * @protected
   * @override
   */
  protected override validate(value: string): void {
    this.validateNotEmpty(value, "组织类型");
    const validTypes = [
      OrganizationType.COMMITTEE,
      OrganizationType.PROJECT_TEAM,
      OrganizationType.QUALITY_GROUP,
      OrganizationType.PERFORMANCE_GROUP,
    ];
    if (!validTypes.includes(value)) {
      throw new Error(`无效的组织类型: ${value}`);
    }
  }

  /**
   * 转换组织类型
   *
   * @protected
   * @override
   */
  protected override transform(value: string): string {
    return value.toUpperCase();
  }

  /**
   * 获取组织类型描述
   *
   * @description 根据组织类型返回对应的中文描述
   *
   * @returns 组织类型描述
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getDescription()); // "委员会"
   * ```
   */
  getDescription(): string {
    const descriptions: Record<string, string> = {
      [OrganizationType.COMMITTEE]: "委员会",
      [OrganizationType.PROJECT_TEAM]: "项目组",
      [OrganizationType.QUALITY_GROUP]: "质量组",
      [OrganizationType.PERFORMANCE_GROUP]: "绩效组",
    };

    return descriptions[this.value] || "未知类型";
  }

  /**
   * 获取组织类型权限级别
   *
   * @description 根据组织类型返回对应的权限级别
   *
   * @returns 权限级别（1-4，数字越大权限越高）
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getPermissionLevel()); // 4
   * ```
   */
  getPermissionLevel(): number {
    const levels: Record<string, number> = {
      [OrganizationType.COMMITTEE]: 4, // 最高权限
      [OrganizationType.PROJECT_TEAM]: 3, // 高权限
      [OrganizationType.QUALITY_GROUP]: 2, // 中等权限
      [OrganizationType.PERFORMANCE_GROUP]: 2, // 中等权限
    };

    return levels[this.value] || 1;
  }

  /**
   * 获取组织类型功能范围
   *
   * @description 根据组织类型返回对应的功能范围
   *
   * @returns 功能范围描述
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.getFunctionScope()); // "决策管理、战略规划、重大事项审批"
   * ```
   */
  getFunctionScope(): string {
    const scopes: Record<string, string> = {
      [OrganizationType.COMMITTEE]: "决策管理、战略规划、重大事项审批",
      [OrganizationType.PROJECT_TEAM]: "项目执行、任务分配、进度管理",
      [OrganizationType.QUALITY_GROUP]: "质量管理、标准制定、质量审核",
      [OrganizationType.PERFORMANCE_GROUP]: "绩效评估、激励管理、考核管理",
    };

    return scopes[this.value] || "基础管理功能";
  }

  /**
   * 检查组织类型是否为决策型
   *
   * @description 判断组织类型是否具有决策权限
   *
   * @returns 是否为决策型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("COMMITTEE");
   * console.log(type.isDecisionType()); // true
   * ```
   */
  isDecisionType(): boolean {
    return this.value === OrganizationType.COMMITTEE;
  }

  /**
   * 检查组织类型是否为执行型
   *
   * @description 判断组织类型是否具有执行权限
   *
   * @returns 是否为执行型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("PROJECT_TEAM");
   * console.log(type.isExecutionType()); // true
   * ```
   */
  isExecutionType(): boolean {
    return this.value === OrganizationType.PROJECT_TEAM;
  }

  /**
   * 检查组织类型是否为专业型
   *
   * @description 判断组织类型是否具有专业权限
   *
   * @returns 是否为专业型组织
   *
   * @example
   * ```typescript
   * const type = OrganizationType.create("QUALITY_GROUP");
   * console.log(type.isProfessionalType()); // true
   * ```
   */
  isProfessionalType(): boolean {
    return (
      this.value === OrganizationType.QUALITY_GROUP ||
      this.value === OrganizationType.PERFORMANCE_GROUP
    );
  }

  /**
   * 验证组织类型是否有效
   *
   * @description 检查给定的字符串是否为有效的组织类型
   *
   * @param type - 要验证的类型字符串
   * @returns 是否为有效类型
   *
   * @example
   * ```typescript
   * const isValid = OrganizationType.isValid("COMMITTEE");
   * console.log(isValid); // true
   *
   * const isInvalid = OrganizationType.isValid("INVALID");
   * console.log(isInvalid); // false
   * ```
   */
  static isValid(type: string): boolean {
    const validTypes = [
      OrganizationType.COMMITTEE,
      OrganizationType.PROJECT_TEAM,
      OrganizationType.QUALITY_GROUP,
      OrganizationType.PERFORMANCE_GROUP,
    ];
    return validTypes.includes(type);
  }

  /**
   * 获取所有组织类型
   *
   * @description 返回所有支持的组织类型列表
   *
   * @returns 所有组织类型数组
   *
   * @example
   * ```typescript
   * const allTypes = OrganizationType.getAllTypes();
   * console.log(allTypes); // ["COMMITTEE", "PROJECT_TEAM", "QUALITY_GROUP", "PERFORMANCE_GROUP"]
   * ```
   */
  static getAllTypes(): string[] {
    return [
      OrganizationType.COMMITTEE,
      OrganizationType.PROJECT_TEAM,
      OrganizationType.QUALITY_GROUP,
      OrganizationType.PERFORMANCE_GROUP,
    ];
  }

  /**
   * 比较组织类型权限级别
   *
   * @description 比较两个组织类型的权限级别
   *
   * @param other - 另一个组织类型
   * @returns 比较结果（-1: 当前权限更低, 0: 权限相等, 1: 当前权限更高）
   *
   * @example
   * ```typescript
   * const type1 = OrganizationType.create("COMMITTEE");
   * const type2 = OrganizationType.create("PROJECT_TEAM");
   * const result = type1.comparePermissionLevel(type2);
   * console.log(result); // 1 (委员会权限更高)
   * ```
   */
  comparePermissionLevel(other: OrganizationType): number {
    const level1 = this.getPermissionLevel();
    const level2 = other.getPermissionLevel();

    if (level1 < level2) return -1;
    if (level1 > level2) return 1;
    return 0;
  }
}
