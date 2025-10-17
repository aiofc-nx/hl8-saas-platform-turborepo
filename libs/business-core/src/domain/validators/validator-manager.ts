/**
 * 验证器管理器
 *
 * @description 统一管理验证器，提供验证器注册、验证和元数据管理
 * @since 1.0.0
 */

import {
  IBaseValidator,
  IValidationResult,
} from "./base-validator.interface.js";
import { EmailValidator } from "./common/email.validator.js";
import { PasswordValidator } from "./common/password.validator.js";
import { UsernameValidator } from "./common/username.validator.js";

/**
 * 验证器管理器
 *
 * @description 统一管理验证器，提供验证器注册、验证和元数据管理
 */
export class ValidatorManager {
  private validators = new Map<string, IBaseValidator>();
  private validatorMetadata = new Map<string, ValidatorMetadata>();

  constructor() {
    this.initializeDefaultValidators();
  }

  /**
   * 初始化默认验证器
   *
   * @private
   */
  private initializeDefaultValidators(): void {
    // 注册邮箱验证器
    this.registerValidator("email", {
      validate: (value: string) => {
        const result = EmailValidator.validateFormat(value);
        return {
          isValid: result.isValid,
          errors: result.error ? [result.error] : [],
          context: { value },
        };
      },
      validateAsync: async (value: string) => {
        return this.validate("email", value);
      },
      getValidatorName: () => "EmailValidator",
      getValidatorVersion: () => "1.0.0",
    });

    // 注册密码验证器
    this.registerValidator("password", {
      validate: (value: string) => {
        const result = PasswordValidator.validateStrength(value);
        return {
          isValid: result.isValid,
          errors: result.errors,
          context: { value, score: result.score },
        };
      },
      validateAsync: async (value: string) => {
        return this.validate("password", value);
      },
      getValidatorName: () => "PasswordValidator",
      getValidatorVersion: () => "1.0.0",
    });

    // 注册用户名验证器
    this.registerValidator("username", {
      validate: (value: string) => {
        const result = UsernameValidator.validateFormat(value);
        return {
          isValid: result.isValid,
          errors: result.errors,
          context: { value },
        };
      },
      validateAsync: async (value: string) => {
        return this.validate("username", value);
      },
      getValidatorName: () => "UsernameValidator",
      getValidatorVersion: () => "1.0.0",
    });
  }

  /**
   * 注册验证器
   *
   * @param name - 验证器名称
   * @param validator - 验证器实例
   * @param metadata - 验证器元数据
   */
  registerValidator(
    name: string,
    validator: IBaseValidator,
    metadata?: ValidatorMetadata,
  ): void {
    this.validators.set(name, validator);
    this.validatorMetadata.set(name, metadata || {
      name,
      version: "1.0.0",
      description: `验证器: ${name}`,
      category: "default",
      tags: [],
    });
  }

  /**
   * 注销验证器
   *
   * @param name - 验证器名称
   */
  unregisterValidator(name: string): void {
    this.validators.delete(name);
    this.validatorMetadata.delete(name);
  }

  /**
   * 获取验证器
   *
   * @param name - 验证器名称
   * @returns 验证器实例
   */
  getValidator(name: string): IBaseValidator | undefined {
    return this.validators.get(name);
  }

  /**
   * 验证值
   *
   * @param name - 验证器名称
   * @param value - 要验证的值
   * @returns 验证结果
   */
  validate(name: string, value: unknown): IValidationResult {
    const validator = this.validators.get(name);
    if (!validator) {
      return {
        isValid: false,
        errors: [`验证器 ${name} 不存在`],
        context: { value },
      };
    }

    try {
      return validator.validate(value);
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `验证器 ${name} 执行失败: ${error instanceof Error ? error.message : String(error)}`,
        ],
        context: { value, error },
      };
    }
  }

  /**
   * 异步验证值
   *
   * @param name - 验证器名称
   * @param value - 要验证的值
   * @returns 验证结果的Promise
   */
  async validateAsync(
    name: string,
    value: unknown,
  ): Promise<IValidationResult> {
    const validator = this.validators.get(name);
    if (!validator) {
      return {
        isValid: false,
        errors: [`验证器 ${name} 不存在`],
        context: { value },
      };
    }

    try {
      return await validator.validateAsync(value);
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `验证器 ${name} 执行失败: ${error instanceof Error ? error.message : String(error)}`,
        ],
        context: { value, error },
      };
    }
  }

  /**
   * 批量验证值
   *
   * @param name - 验证器名称
   * @param values - 要验证的值列表
   * @returns 验证结果列表
   */
  validateBatch(name: string, values: unknown[]): IValidationResult[] {
    return values.map((value) => this.validate(name, value));
  }

  /**
   * 异步批量验证值
   *
   * @param name - 验证器名称
   * @param values - 要验证的值列表
   * @returns 验证结果列表的Promise
   */
  async validateBatchAsync(
    name: string,
    values: unknown[],
  ): Promise<IValidationResult[]> {
    const promises = values.map((value) => this.validateAsync(name, value));
    return Promise.all(promises);
  }

  /**
   * 获取所有验证器名称
   *
   * @returns 验证器名称列表
   */
  getValidatorNames(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * 获取验证器元数据
   *
   * @param name - 验证器名称
   * @returns 验证器元数据
   */
  getValidatorMetadata(name: string): ValidatorMetadata | undefined {
    return this.validatorMetadata.get(name);
  }

  /**
   * 获取所有验证器元数据
   *
   * @returns 验证器元数据列表
   */
  getAllValidatorMetadata(): ValidatorMetadata[] {
    return Array.from(this.validatorMetadata.values());
  }

  /**
   * 获取验证器统计信息
   *
   * @returns 验证器统计信息
   */
  getStatistics(): ValidatorStatistics {
    const _validators = Array.from(this.validators.values());
    const metadata = Array.from(this.validatorMetadata.values());

    const categoryStats = metadata.reduce(
      (stats, meta) => {
        const category = meta.category;
        stats[category] = (stats[category] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    const validators = metadata.map((meta) => ({
      name: meta.name,
      version: meta.version,
      category: meta.category,
      description: meta.description,
    }));

    return {
      totalValidators: this.validators.size,
      totalCategories: Object.keys(categoryStats).length,
      categoryStats,
      validators,
    };
  }

  /**
   * 检查验证器是否存在
   *
   * @param name - 验证器名称
   * @returns 是否存在
   */
  hasValidator(name: string): boolean {
    return this.validators.has(name);
  }

  /**
   * 清空所有验证器
   */
  clear(): void {
    this.validators.clear();
    this.validatorMetadata.clear();
  }
}

/**
 * 验证器元数据
 */
export interface ValidatorMetadata {
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
}

/**
 * 验证器统计信息
 */
export interface ValidatorStatistics {
  totalValidators: number;
  totalCategories: number;
  categoryStats: Record<string, number>;
  validators: Array<{
    name: string;
    version: string;
    category: string;
    description: string;
  }>;
}