/**
 * 组织类型枚举
 *
 * @description 定义系统中所有组织类型的枚举值
 *
 * ## 业务规则
 *
 * ### 组织类型规则
 * - 委员会：决策管理、战略规划、重大事项审批
 * - 项目组：项目执行、任务分配、进度管理
 * - 质量组：质量监督、标准制定、流程优化
 * - 绩效组：绩效评估、考核管理、激励制度
 *
 * ### 权限级别规则
 * - 委员会：最高权限级别（4级）
 * - 项目组：执行权限级别（3级）
 * - 质量组：专业权限级别（2级）
 * - 绩效组：专业权限级别（2级）
 *
 * @example
 * ```typescript
 * import { OrganizationType } from './organization-type.enum.js';
 *
 * // 检查组织类型
 * console.log(OrganizationType.COMMITTEE); // "COMMITTEE"
 * console.log(OrganizationTypeUtils.isDecisionType(OrganizationType.COMMITTEE)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum OrganizationType {
  /** 委员会 */
  COMMITTEE = "COMMITTEE",
  /** 项目组 */
  PROJECT_TEAM = "PROJECT_TEAM",
  /** 质量组 */
  QUALITY_GROUP = "QUALITY_GROUP",
  /** 绩效组 */
  PERFORMANCE_GROUP = "PERFORMANCE_GROUP",
}

/**
 * 组织类型工具类
 *
 * @description 提供组织类型相关的工具方法
 */
export class OrganizationTypeUtils {
  /**
   * 组织类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<OrganizationType, string> =
    {
      [OrganizationType.COMMITTEE]: "委员会",
      [OrganizationType.PROJECT_TEAM]: "项目组",
      [OrganizationType.QUALITY_GROUP]: "质量组",
      [OrganizationType.PERFORMANCE_GROUP]: "绩效组",
    };

  /**
   * 组织类型功能范围映射
   */
  private static readonly TYPE_FUNCTION_SCOPES: Record<
    OrganizationType,
    string
  > = {
    [OrganizationType.COMMITTEE]: "决策管理、战略规划、重大事项审批",
    [OrganizationType.PROJECT_TEAM]: "项目执行、任务分配、进度管理",
    [OrganizationType.QUALITY_GROUP]: "质量监督、标准制定、流程优化",
    [OrganizationType.PERFORMANCE_GROUP]: "绩效评估、考核管理、激励制度",
  };

  /**
   * 组织类型权限级别映射
   */
  private static readonly TYPE_PERMISSION_LEVELS: Record<
    OrganizationType,
    number
  > = {
    [OrganizationType.COMMITTEE]: 4,
    [OrganizationType.PROJECT_TEAM]: 3,
    [OrganizationType.QUALITY_GROUP]: 2,
    [OrganizationType.PERFORMANCE_GROUP]: 2,
  };

  /**
   * 组织类型分类映射
   */
  private static readonly TYPE_CATEGORIES: Record<OrganizationType, string> = {
    [OrganizationType.COMMITTEE]: "DECISION",
    [OrganizationType.PROJECT_TEAM]: "EXECUTION",
    [OrganizationType.QUALITY_GROUP]: "PROFESSIONAL",
    [OrganizationType.PERFORMANCE_GROUP]: "PROFESSIONAL",
  };

  /**
   * 检查是否为委员会
   *
   * @param type - 组织类型
   * @returns 是否为委员会
   * @example
   * ```typescript
   * const isCommittee = OrganizationTypeUtils.isCommittee(OrganizationType.COMMITTEE);
   * console.log(isCommittee); // true
   * ```
   */
  static isCommittee(type: OrganizationType): boolean {
    return type === OrganizationType.COMMITTEE;
  }

  /**
   * 检查是否为项目组
   *
   * @param type - 组织类型
   * @returns 是否为项目组
   */
  static isProjectTeam(type: OrganizationType): boolean {
    return type === OrganizationType.PROJECT_TEAM;
  }

  /**
   * 检查是否为质量组
   *
   * @param type - 组织类型
   * @returns 是否为质量组
   */
  static isQualityGroup(type: OrganizationType): boolean {
    return type === OrganizationType.QUALITY_GROUP;
  }

  /**
   * 检查是否为绩效组
   *
   * @param type - 组织类型
   * @returns 是否为绩效组
   */
  static isPerformanceGroup(type: OrganizationType): boolean {
    return type === OrganizationType.PERFORMANCE_GROUP;
  }

  /**
   * 检查是否为决策类型
   *
   * @param type - 组织类型
   * @returns 是否为决策类型
   */
  static isDecisionType(type: OrganizationType): boolean {
    return this.TYPE_CATEGORIES[type] === "DECISION";
  }

  /**
   * 检查是否为执行类型
   *
   * @param type - 组织类型
   * @returns 是否为执行类型
   */
  static isExecutionType(type: OrganizationType): boolean {
    return this.TYPE_CATEGORIES[type] === "EXECUTION";
  }

  /**
   * 检查是否为专业类型
   *
   * @param type - 组织类型
   * @returns 是否为专业类型
   */
  static isProfessionalType(type: OrganizationType): boolean {
    return this.TYPE_CATEGORIES[type] === "PROFESSIONAL";
  }

  /**
   * 获取组织类型描述
   *
   * @param type - 组织类型
   * @returns 组织类型描述
   */
  static getDescription(type: OrganizationType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知组织类型";
  }

  /**
   * 获取组织类型功能范围
   *
   * @param type - 组织类型
   * @returns 功能范围
   */
  static getFunctionScope(type: OrganizationType): string {
    return this.TYPE_FUNCTION_SCOPES[type] || "未知功能";
  }

  /**
   * 获取组织类型权限级别
   *
   * @param type - 组织类型
   * @returns 权限级别
   */
  static getPermissionLevel(type: OrganizationType): number {
    return this.TYPE_PERMISSION_LEVELS[type] || 0;
  }

  /**
   * 检查组织类型权限级别是否高于指定类型
   *
   * @param type1 - 类型1
   * @param type2 - 类型2
   * @returns 类型1是否高于类型2
   */
  static hasHigherPermissionLevel(
    type1: OrganizationType,
    type2: OrganizationType,
  ): boolean {
    return (
      this.TYPE_PERMISSION_LEVELS[type1] > this.TYPE_PERMISSION_LEVELS[type2]
    );
  }

  /**
   * 比较两个组织类型的权限级别
   *
   * @param type1 - 第一个组织类型
   * @param type2 - 第二个组织类型
   * @returns 比较结果：1表示type1权限更高，-1表示type2权限更高，0表示相等
   */
  static comparePermissionLevel(
    type1: OrganizationType,
    type2: OrganizationType,
  ): number {
    const level1 = this.TYPE_PERMISSION_LEVELS[type1];
    const level2 = this.TYPE_PERMISSION_LEVELS[type2];

    if (level1 > level2) return 1;
    if (level1 < level2) return -1;
    return 0;
  }

  /**
   * 获取所有组织类型
   *
   * @returns 所有组织类型数组
   */
  static getAllTypes(): OrganizationType[] {
    return Object.values(OrganizationType);
  }

  /**
   * 获取决策类型（委员会）
   *
   * @returns 决策类型数组
   */
  static getDecisionTypes(): OrganizationType[] {
    return [OrganizationType.COMMITTEE];
  }

  /**
   * 获取执行类型（项目组）
   *
   * @returns 执行类型数组
   */
  static getExecutionTypes(): OrganizationType[] {
    return [OrganizationType.PROJECT_TEAM];
  }

  /**
   * 获取专业类型（质量组、绩效组）
   *
   * @returns 专业类型数组
   */
  static getProfessionalTypes(): OrganizationType[] {
    return [OrganizationType.QUALITY_GROUP, OrganizationType.PERFORMANCE_GROUP];
  }
}
