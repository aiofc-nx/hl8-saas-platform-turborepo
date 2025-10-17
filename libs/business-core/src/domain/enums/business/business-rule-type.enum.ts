/**
 * 业务规则类型枚举
 *
 * @description 定义系统中所有业务规则类型的枚举值
 *
 * ## 业务规则
 *
 * ### 业务规则类型规则
 * - 格式验证规则：数据格式验证
 * - 业务逻辑规则：业务逻辑验证
 * - 数据完整性规则：数据完整性验证
 * - 权限验证规则：权限验证
 * - 配额限制规则：配额限制验证
 * - 时间约束规则：时间约束验证
 * - 依赖关系规则：依赖关系验证
 *
 * @example
 * ```typescript
 * import { BusinessRuleType } from './business-rule-type.enum.js';
 *
 * // 检查规则类型
 * console.log(BusinessRuleType.FORMAT_VALIDATION); // "format_validation"
 * console.log(BusinessRuleTypeUtils.isFormatValidation(BusinessRuleType.FORMAT_VALIDATION)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum BusinessRuleType {
  /** 格式验证规则 */
  FORMAT_VALIDATION = "format_validation",
  /** 业务逻辑规则 */
  BUSINESS_LOGIC = "business_logic",
  /** 数据完整性规则 */
  DATA_INTEGRITY = "data_integrity",
  /** 权限验证规则 */
  PERMISSION_CHECK = "permission_check",
  /** 配额限制规则 */
  QUOTA_LIMIT = "quota_limit",
  /** 时间约束规则 */
  TIME_CONSTRAINT = "time_constraint",
  /** 依赖关系规则 */
  DEPENDENCY_CHECK = "dependency_check",
}

/**
 * 业务规则类型工具类
 *
 * @description 提供业务规则类型相关的工具方法
 */
export class BusinessRuleTypeUtils {
  /**
   * 规则类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<BusinessRuleType, string> = {
    [BusinessRuleType.FORMAT_VALIDATION]: "格式验证规则",
    [BusinessRuleType.BUSINESS_LOGIC]: "业务逻辑规则",
    [BusinessRuleType.DATA_INTEGRITY]: "数据完整性规则",
    [BusinessRuleType.PERMISSION_CHECK]: "权限验证规则",
    [BusinessRuleType.QUOTA_LIMIT]: "配额限制规则",
    [BusinessRuleType.TIME_CONSTRAINT]: "时间约束规则",
    [BusinessRuleType.DEPENDENCY_CHECK]: "依赖关系规则",
  };

  /**
   * 检查是否为格式验证规则
   *
   * @param type - 业务规则类型
   * @returns 是否为格式验证规则
   * @example
   * ```typescript
   * const isFormat = BusinessRuleTypeUtils.isFormatValidation(BusinessRuleType.FORMAT_VALIDATION);
   * console.log(isFormat); // true
   * ```
   */
  static isFormatValidation(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.FORMAT_VALIDATION;
  }

  /**
   * 检查是否为业务逻辑规则
   *
   * @param type - 业务规则类型
   * @returns 是否为业务逻辑规则
   */
  static isBusinessLogic(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.BUSINESS_LOGIC;
  }

  /**
   * 检查是否为数据完整性规则
   *
   * @param type - 业务规则类型
   * @returns 是否为数据完整性规则
   */
  static isDataIntegrity(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.DATA_INTEGRITY;
  }

  /**
   * 检查是否为权限验证规则
   *
   * @param type - 业务规则类型
   * @returns 是否为权限验证规则
   */
  static isPermissionCheck(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.PERMISSION_CHECK;
  }

  /**
   * 检查是否为配额限制规则
   *
   * @param type - 业务规则类型
   * @returns 是否为配额限制规则
   */
  static isQuotaLimit(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.QUOTA_LIMIT;
  }

  /**
   * 检查是否为时间约束规则
   *
   * @param type - 业务规则类型
   * @returns 是否为时间约束规则
   */
  static isTimeConstraint(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.TIME_CONSTRAINT;
  }

  /**
   * 检查是否为依赖关系规则
   *
   * @param type - 业务规则类型
   * @returns 是否为依赖关系规则
   */
  static isDependencyCheck(type: BusinessRuleType): boolean {
    return type === BusinessRuleType.DEPENDENCY_CHECK;
  }

  /**
   * 获取规则类型描述
   *
   * @param type - 业务规则类型
   * @returns 规则类型描述
   */
  static getDescription(type: BusinessRuleType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知业务规则类型";
  }

  /**
   * 获取所有规则类型
   *
   * @returns 所有规则类型数组
   */
  static getAllTypes(): BusinessRuleType[] {
    return Object.values(BusinessRuleType);
  }

  /**
   * 获取验证规则类型（格式验证、数据完整性）
   *
   * @returns 验证规则类型数组
   */
  static getValidationTypes(): BusinessRuleType[] {
    return [
      BusinessRuleType.FORMAT_VALIDATION,
      BusinessRuleType.DATA_INTEGRITY,
    ];
  }

  /**
   * 获取业务规则类型（业务逻辑、权限验证、配额限制、时间约束、依赖关系）
   *
   * @returns 业务规则类型数组
   */
  static getBusinessTypes(): BusinessRuleType[] {
    return [
      BusinessRuleType.BUSINESS_LOGIC,
      BusinessRuleType.PERMISSION_CHECK,
      BusinessRuleType.QUOTA_LIMIT,
      BusinessRuleType.TIME_CONSTRAINT,
      BusinessRuleType.DEPENDENCY_CHECK,
    ];
  }
}
