/**
 * 组织层级业务规则
 *
 * @description 验证组织层级的有效性
 * @since 1.0.0
 */

import {
  IBaseBusinessRule,
  BusinessRuleType,
  BusinessRuleScope,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

/**
 * 组织层级业务规则
 *
 * @description 验证组织层级必须在1-8之间
 */
export class OrganizationLevelRule implements IBaseBusinessRule<number> {
  readonly id = "organization-level-rule";
  readonly code = "ORGANIZATION_LEVEL_RULE";
  readonly name = "组织层级规则";
  readonly description = "组织层级必须在1-8之间";
  readonly type = BusinessRuleType.BUSINESS_LOGIC;
  readonly scope = BusinessRuleScope.ENTITY;

  /**
   * 验证组织层级
   *
   * @param value - 组织层级
   * @returns 验证结果
   */
  validate(value: number): IBusinessRuleValidationResult {
    if (typeof value !== "number" || isNaN(value)) {
      return {
        isValid: false,
        errorMessage: "组织层级必须是有效数字",
        errorCode: "INVALID_LEVEL_TYPE",
        context: { value },
      };
    }

    if (value < 1) {
      return {
        isValid: false,
        errorMessage: "组织层级不能小于1",
        errorCode: "LEVEL_TOO_LOW",
        context: { value, minLevel: 1 },
      };
    }

    if (value > 8) {
      return {
        isValid: false,
        errorMessage: "组织层级不能大于8",
        errorCode: "LEVEL_TOO_HIGH",
        context: { value, maxLevel: 8 },
      };
    }

    return {
      isValid: true,
      context: { value },
    };
  }

  /**
   * 异步验证组织层级
   *
   * @param value - 组织层级
   * @returns 验证结果的Promise
   */
  async validateAsync(value: number): Promise<IBusinessRuleValidationResult> {
    return Promise.resolve(this.validate(value));
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
    };
  }
}
