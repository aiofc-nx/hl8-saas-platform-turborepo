/**
 * 邮箱格式业务规则
 *
 * @description 验证邮箱地址的格式有效性
 * @since 1.0.0
 */

import {
  IBaseBusinessRule,
  BusinessRuleType,
  BusinessRuleScope,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

/**
 * 邮箱格式业务规则
 *
 * @description 验证邮箱地址格式的有效性
 */
export class EmailFormatRule implements IBaseBusinessRule<string> {
  readonly id = "email-format-rule";
  readonly code = "EMAIL_FORMAT_RULE";
  readonly name = "邮箱格式规则";
  readonly description = "邮箱地址必须符合标准格式";
  readonly type = BusinessRuleType.FORMAT_VALIDATION;
  readonly scope = BusinessRuleScope.FIELD;

  private readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * 验证邮箱格式
   *
   * @param value - 邮箱地址
   * @returns 验证结果
   */
  validate(value: string): IBusinessRuleValidationResult {
    if (!value || !value.trim()) {
      return {
        isValid: false,
        errorMessage: "邮箱地址不能为空",
        errorCode: "EMAIL_EMPTY",
        context: { value },
      };
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > 254) {
      return {
        isValid: false,
        errorMessage: "邮箱地址长度不能超过254字符",
        errorCode: "EMAIL_TOO_LONG",
        context: { value: trimmedValue, length: trimmedValue.length },
      };
    }

    if (!this.emailRegex.test(trimmedValue)) {
      return {
        isValid: false,
        errorMessage: "邮箱地址格式无效",
        errorCode: "EMAIL_INVALID_FORMAT",
        context: { value: trimmedValue },
      };
    }

    return {
      isValid: true,
      context: { value: trimmedValue },
    };
  }

  /**
   * 异步验证邮箱格式
   *
   * @param value - 邮箱地址
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
      maxLength: 254,
      pattern: this.emailRegex.source,
    };
  }
}
