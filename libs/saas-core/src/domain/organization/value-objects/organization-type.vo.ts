/**
 * 组织类型值对象
 *
 * @description 封装组织类型的验证逻辑和业务规则
 *
 * ## 业务规则
 *
 * ### 组织类型
 * - PROFESSIONAL_COMMITTEE: 专业委员会
 * - PROJECT_TEAM: 项目管理团队
 * - QUALITY_CONTROL: 质量控制小组
 * - PERFORMANCE_TEAM: 绩效管理小组
 * - CUSTOM: 自定义类型
 *
 * ### 验证规则
 * - 必须是预定义的类型之一
 * - 不可为空
 *
 * @example
 * ```typescript
 * // 使用继承的 create 方法
 * const type = OrganizationType.create('PROFESSIONAL_COMMITTEE');
 * const customType = OrganizationType.custom();
 *
 * // 访问原始值（使用继承的 value 属性）
 * console.log(type.value); // 'PROFESSIONAL_COMMITTEE'
 * ```
 *
 * @class OrganizationType
 * @since 1.0.0
 * @updated 1.1.0 - 使用新的 BaseValueObject 泛型 API
 */

import { BaseValueObject } from "@hl8/business-core/index.js";
import { ORGANIZATION_TYPE_CONFIG } from "../../../constants/organization.constants.js";

/**
 * 组织类型枚举
 */
export type OrganizationTypeValue =
  | "PROFESSIONAL_COMMITTEE"
  | "PROJECT_TEAM"
  | "QUALITY_CONTROL"
  | "PERFORMANCE_TEAM"
  | "CUSTOM";

/**
 * 所有允许的组织类型
 */
const ALLOWED_TYPES: readonly OrganizationTypeValue[] = [
  "PROFESSIONAL_COMMITTEE",
  "PROJECT_TEAM",
  "QUALITY_CONTROL",
  "PERFORMANCE_TEAM",
  "CUSTOM",
] as const;

export class OrganizationType extends BaseValueObject<OrganizationTypeValue> {
  /**
   * 验证组织类型
   *
   * @protected
   */
  protected validate(value: OrganizationTypeValue): void {
    (this as any).validateNotEmpty(value, "组织类型");
    (this as any).validateEnum(
      value,
      ALLOWED_TYPES as unknown as string[],
      "组织类型",
    );
  }

  // ============ 静态工厂方法 ============

  /**
   * 创建专业委员会类型
   */
  public static professionalCommittee(): OrganizationType {
    return (OrganizationType as any).create("PROFESSIONAL_COMMITTEE");
  }

  /**
   * 创建项目团队类型
   */
  public static projectTeam(): OrganizationType {
    return (OrganizationType as any).create("PROJECT_TEAM");
  }

  /**
   * 创建质量控制类型
   */
  public static qualityControl(): OrganizationType {
    return (OrganizationType as any).create("QUALITY_CONTROL");
  }

  /**
   * 创建绩效管理类型
   */
  public static performanceTeam(): OrganizationType {
    return (OrganizationType as any).create("PERFORMANCE_TEAM");
  }

  /**
   * 创建自定义类型
   */
  public static custom(): OrganizationType {
    return (OrganizationType as any).create("CUSTOM");
  }

  // ============ 类型检查方法 ============

  /**
   * 是否为专业委员会
   */
  public isProfessionalCommittee(): boolean {
    return (this as any)._value === "PROFESSIONAL_COMMITTEE";
  }

  /**
   * 是否为项目团队
   */
  public isProjectTeam(): boolean {
    return (this as any)._value === "PROJECT_TEAM";
  }

  /**
   * 是否为质量控制
   */
  public isQualityControl(): boolean {
    return (this as any)._value === "QUALITY_CONTROL";
  }

  /**
   * 是否为绩效管理
   */
  public isPerformanceTeam(): boolean {
    return (this as any)._value === "PERFORMANCE_TEAM";
  }

  /**
   * 是否为自定义类型
   */
  public isCustom(): boolean {
    return (this as any)._value === "CUSTOM";
  }

  // ============ 辅助方法 ============

  /**
   * 获取组织类型的显示名称
   */
  public getDisplayName(): string {
    const config = ORGANIZATION_TYPE_CONFIG[(this as any)._value];
    return config?.name || (this as any)._value;
  }

  /**
   * 获取组织类型名称（别名，向后兼容）
   */
  public getName(): string {
    return this.getDisplayName();
  }

  /**
   * 获取组织类型的描述
   */
  public getDescription(): string {
    const config = ORGANIZATION_TYPE_CONFIG[(this as any)._value];
    return config?.description || "";
  }

  /**
   * 验证组织类型是否有效
   */
  public static isValid(type: string): boolean {
    try {
      (OrganizationType as any).create(type as OrganizationTypeValue);
      return true;
    } catch {
      return false;
    }
  }
}
