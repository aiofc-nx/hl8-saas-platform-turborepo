/**
 * 部门层级业务规则
 *
 * @description 验证部门层级的有效性
 * @since 1.0.0
 */

import {
  IBaseBusinessRule,
  BusinessRuleType,
  BusinessRuleScope,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

/**
 * 部门层级业务规则
 *
 * @description 验证部门层级必须在1-8之间，且不能超过组织层级
 */
export class DepartmentLevelRule implements IBaseBusinessRule<number> {
  readonly id = "department-level-rule";
  readonly code = "DEPARTMENT_LEVEL_RULE";
  readonly name = "部门层级规则";
  readonly description = "部门层级必须在1-8之间，且不能超过组织层级";
  readonly type = BusinessRuleType.BUSINESS_LOGIC;
  readonly scope = BusinessRuleScope.CROSS_AGGREGATE;

  /**
   * 验证部门层级
   *
   * @param value - 部门层级
   * @param context - 验证上下文，包含组织层级
   * @returns 验证结果
   */
  validate(
    value: number,
    context?: { organizationLevel?: number },
  ): IBusinessRuleValidationResult {
    if (typeof value !== "number" || isNaN(value)) {
      return {
        isValid: false,
        errorMessage: "部门层级必须是有效数字",
        errorCode: "INVALID_LEVEL_TYPE",
        context: { value },
      };
    }

    if (value < 1) {
      return {
        isValid: false,
        errorMessage: "部门层级不能小于1",
        errorCode: "LEVEL_TOO_LOW",
        context: { value, minLevel: 1 },
      };
    }

    if (value > 8) {
      return {
        isValid: false,
        errorMessage: "部门层级不能大于8",
        errorCode: "LEVEL_TOO_HIGH",
        context: { value, maxLevel: 8 },
      };
    }

    // 检查是否超过组织层级
    if (context?.organizationLevel && value > context.organizationLevel) {
      return {
        isValid: false,
        errorMessage: "部门层级不能超过组织层级",
        errorCode: "DEPARTMENT_LEVEL_EXCEEDS_ORGANIZATION",
        context: {
          value,
          organizationLevel: context.organizationLevel,
        },
      };
    }

    return {
      isValid: true,
      context: { value, organizationLevel: context?.organizationLevel },
    };
  }

  /**
   * 异步验证部门层级
   *
   * @param value - 部门层级
   * @param context - 验证上下文
   * @returns 验证结果的Promise
   */
  async validateAsync(
    value: number,
    context?: { organizationLevel?: number },
  ): Promise<IBusinessRuleValidationResult> {
    return Promise.resolve(this.validate(value, context));
  }

  /**
   * 检查规则是否有效
   *
   * @returns 规则是否有效
   */
  isValid(): boolean {
    return true;
  }

  /**
   * 获取规则元数据
   *
   * @returns 规则元数据
   */
  getMetadata(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      scope: this.scope,
      minLevel: 1,
      maxLevel: 8,
      requiresOrganizationLevel: true,
    };
  }
}
