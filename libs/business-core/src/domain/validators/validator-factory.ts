/**
 * 验证器工厂
 *
 * @description 创建和管理验证器实例，提供验证器的统一创建接口
 * @since 1.0.0
 */

import { ValidatorManager } from './validator-manager.js';
import { IBaseValidator } from './base-validator.interface.js';

/**
 * 验证器工厂
 *
 * @description 创建和管理验证器实例，提供验证器的统一创建接口
 */
export class ValidatorFactory {
  private static instance: ValidatorFactory;
  private validatorManager: ValidatorManager;

  private constructor() {
    this.validatorManager = new ValidatorManager();
  }

  /**
   * 获取单例实例
   *
   * @returns 验证器工厂实例
   */
  static getInstance(): ValidatorFactory {
    if (!ValidatorFactory.instance) {
      ValidatorFactory.instance = new ValidatorFactory();
    }
    return ValidatorFactory.instance;
  }

  /**
   * 创建验证器管理器
   *
   * @returns 验证器管理器实例
   */
  createValidatorManager(): ValidatorManager {
    return new ValidatorManager();
  }

  /**
   * 创建邮箱验证器
   *
   * @returns 邮箱验证器实例
   */
  createEmailValidator(): IBaseValidator {
    return {
      validate: (value: string) => {
        const { EmailValidator } = require('./common/email.validator.js');
        const result = EmailValidator.validateFormat(value);
        return {
          isValid: result.isValid,
          errors: result.error ? [result.error] : [],
          context: { value }
        };
      },
      validateAsync: async (value: string) => {
        return this.createEmailValidator().validate(value);
      },
      getValidatorName: () => 'EmailValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 创建密码验证器
   *
   * @returns 密码验证器实例
   */
  createPasswordValidator(): IBaseValidator {
    return {
      validate: (value: string) => {
        const { PasswordValidator } = require('./common/password.validator.js');
        const result = PasswordValidator.validateStrength(value);
        return {
          isValid: result.isValid,
          errors: result.errors,
          context: { value, score: result.score }
        };
      },
      validateAsync: async (value: string) => {
        return this.createPasswordValidator().validate(value);
      },
      getValidatorName: () => 'PasswordValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 创建用户名验证器
   *
   * @returns 用户名验证器实例
   */
  createUsernameValidator(): IBaseValidator {
    return {
      validate: (value: string) => {
        const { UsernameValidator } = require('./common/username.validator.js');
        const result = UsernameValidator.validateFormat(value);
        return {
          isValid: result.isValid,
          errors: result.errors,
          context: { value }
        };
      },
      validateAsync: async (value: string) => {
        return this.createUsernameValidator().validate(value);
      },
      getValidatorName: () => 'UsernameValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 创建复合验证器
   *
   * @param validators - 验证器列表
   * @returns 复合验证器实例
   */
  createCompositeValidator(validators: IBaseValidator[]): IBaseValidator {
    return {
      validate: (value: unknown) => {
        const allErrors: string[] = [];
        let isValid = true;

        for (const validator of validators) {
          const result = validator.validate(value);
          if (!result.isValid) {
            isValid = false;
            allErrors.push(...result.errors);
          }
        }

        return {
          isValid,
          errors: allErrors,
          context: { value, validators: validators.length }
        };
      },
      validateAsync: async (value: unknown) => {
        const allErrors: string[] = [];
        let isValid = true;

        for (const validator of validators) {
          const result = await validator.validateAsync(value);
          if (!result.isValid) {
            isValid = false;
            allErrors.push(...result.errors);
          }
        }

        return {
          isValid,
          errors: allErrors,
          context: { value, validators: validators.length }
        };
      },
      getValidatorName: () => 'CompositeValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 创建条件验证器
   *
   * @param condition - 条件函数
   * @param validator - 验证器
   * @returns 条件验证器实例
   */
  createConditionalValidator(
    condition: (value: unknown) => boolean,
    validator: IBaseValidator
  ): IBaseValidator {
    return {
      validate: (value: unknown) => {
        if (!condition(value)) {
          return {
            isValid: true,
            errors: [],
            context: { value, skipped: true }
          };
        }
        return validator.validate(value);
      },
      validateAsync: async (value: unknown) => {
        if (!condition(value)) {
          return {
            isValid: true,
            errors: [],
            context: { value, skipped: true }
          };
        }
        return await validator.validateAsync(value);
      },
      getValidatorName: () => 'ConditionalValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 创建链式验证器
   *
   * @param validators - 验证器链
   * @returns 链式验证器实例
   */
  createChainValidator(validators: IBaseValidator[]): IBaseValidator {
    return {
      validate: (value: unknown) => {
        for (const validator of validators) {
          const result = validator.validate(value);
          if (!result.isValid) {
            return result;
          }
        }
        return {
          isValid: true,
          errors: [],
          context: { value, validators: validators.length }
        };
      },
      validateAsync: async (value: unknown) => {
        for (const validator of validators) {
          const result = await validator.validateAsync(value);
          if (!result.isValid) {
            return result;
          }
        }
        return {
          isValid: true,
          errors: [],
          context: { value, validators: validators.length }
        };
      },
      getValidatorName: () => 'ChainValidator',
      getValidatorVersion: () => '1.0.0'
    };
  }

  /**
   * 获取验证器管理器
   *
   * @returns 验证器管理器实例
   */
  getValidatorManager(): ValidatorManager {
    return this.validatorManager;
  }

  /**
   * 重置验证器工厂
   */
  reset(): void {
    this.validatorManager.clear();
  }
}
