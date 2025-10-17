/**
 * 租户名称业务规则
 *
 * @description 验证租户名称的格式和长度要求
 * @since 1.0.0
 */

import {
  IBaseBusinessRule,
  BusinessRuleType,
  BusinessRuleScope,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

/**
 * 租户名称业务规则
 *
 * @description 验证租户名称必须非空且长度不超过100字符
 */
export class TenantNameRule implements IBaseBusinessRule<string> {
  readonly id = "tenant-name-rule";
  readonly code = "TENANT_NAME_RULE";
  readonly name = "租户名称规则";
  readonly description = "租户名称必须非空且长度不超过100字符";
  readonly type = BusinessRuleType.FORMAT_VALIDATION;
  readonly scope = BusinessRuleScope.FIELD;

  /**
   * 验证租户名称
   *
   * @param value - 租户名称
   * @returns 验证结果
   */
  validate(value: string): IBusinessRuleValidationResult {
    if (!value || !value.trim()) {
      return {
        isValid: false,
        errorMessage: "租户名称不能为空",
        errorCode: "TENANT_NAME_EMPTY",
        context: { value },
      };
    }

    if (value.trim().length > 100) {
      return {
        isValid: false,
        errorMessage: "租户名称长度不能超过100字符",
        errorCode: "TENANT_NAME_TOO_LONG",
        context: { value, length: value.length },
      };
    }

    return {
      isValid: true,
      context: { value, length: value.length },
    };
  }

  /**
   * 异步验证租户名称
   *
   * @param value - 租户名称
   * @returns 验证结果的Promise
   */
  async validateAsync(value: string): Promise<IBusinessRuleValidationResult> {
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
      maxLength: 100,
      minLength: 1,
    };
  }
}
