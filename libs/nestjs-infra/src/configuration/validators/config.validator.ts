/**
 * 配置验证器
 *
 * @description 基于 class-validator 的配置验证
 *
 * @since 0.3.0
 */

import { validateSync, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GeneralBadRequestException } from '../../exceptions/core/general-bad-request.exception.js';

/**
 * 验证选项
 */
export interface ValidateOptions {
  /** 是否移除未定义的属性 */
  whitelist?: boolean;
  /** 是否禁止未定义的属性 */
  forbidNonWhitelisted?: boolean;
  /** 是否跳过缺失的属性 */
  skipMissingProperties?: boolean;
}

/**
 * 配置验证器
 */
export class ConfigValidator {
  /**
   * 验证配置对象
   *
   * @param schema - 配置 Schema 类
   * @param config - 配置对象
   * @param options - 验证选项
   * @returns 验证后的配置实例
   * @throws {GeneralBadRequestException} 验证失败
   *
   * @example
   * ```typescript
   * class AppConfig {
   *   @IsString()
   *   @IsNotEmpty()
   *   appName!: string;
   * }
   *
   * const validated = ConfigValidator.validate(AppConfig, { appName: 'MyApp' });
   * ```
   */
  static validate<T extends object>(
    schema: new () => T,
    config: Record<string, any>,
    options: ValidateOptions = {},
  ): T {
    // 转换为类实例
    const instance = plainToClass(schema, config);

    // 执行验证
    const errors = validateSync(instance as object, {
      whitelist: options.whitelist ?? true,
      forbidNonWhitelisted: options.forbidNonWhitelisted ?? true,
      skipMissingProperties: options.skipMissingProperties ?? false,
    });

    if (errors.length > 0) {
      throw new GeneralBadRequestException(
        '配置验证失败',
        '配置文件包含错误',
        { errors: this.formatErrors(errors) },
      );
    }

    return instance;
  }

  /**
   * 格式化验证错误
   *
   * @param errors - 验证错误数组
   * @returns 格式化后的错误信息
   * @private
   */
  private static formatErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length
        ? this.formatErrors(error.children)
        : undefined,
    }));
  }
}

