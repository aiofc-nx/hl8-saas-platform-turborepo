/**
 * 用例装饰器
 *
 * 用于标记和配置用例类，提供用例的元数据管理和自动发现功能。
 * 这个装饰器使得框架能够自动识别用例，并为其提供相应的基础设施支持。
 *
 * @description 用例装饰器提供了声明式的用例定义方式
 *
 * ## 业务规则
 *
 * ### 用例标识规则
 * - 每个用例必须有唯一的名称标识
 * - 用例名称用于注册表管理和路由
 * - 用例名称应该反映业务意图
 * - 用例名称在系统内必须唯一
 *
 * ### 用例类型规则
 * - 用例类型分为命令(command)和查询(query)
 * - 命令用例处理状态变更操作
 * - 查询用例处理数据检索操作
 * - 用例类型决定了执行策略和优化方式
 *
 * ### 用例权限规则
 * - 用例可以定义所需的权限列表
 * - 权限验证在用例执行前进行
 * - 权限不足时抛出权限异常
 * - 权限应该遵循最小权限原则
 *
 * ### 用例监控规则
 * - 用例执行应该被监控和度量
 * - 关键用例的性能指标应该被收集
 * - 用例执行失败应该触发告警
 * - 用例使用情况应该用于业务分析
 *
 * @example
 * ```typescript
 * @UseCase({
 *   name: 'CreateUser',
 *   description: '创建用户用例',
 *   type: 'command',
 *   permissions: ['user:create'],
 *   critical: true,
 *   monitored: true
 * })
 * export class CreateUserUseCase extends BaseCommandUseCase<CreateUserRequest, CreateUserResponse> {
 *   // 用例实现
 * }
 * ```
 *
 * @since 1.0.0
 */

import "reflect-metadata";
import { ValidationException } from "../../../common/exceptions/business.exceptions.js";
import { UseCaseType } from "../../../common/enums/application/use-case-type.enum.js";

// 导入用例类型定义
import type {
  IUseCaseOptions,
  IUseCaseMetadata,
} from "../../../common/types/application/use-case.types.js";

// 导入装饰器类型定义
import type { ClassConstructor } from "../../../common/types/application/decorator.types.js";

// 导入用例常量
import { USE_CASE_METADATA_KEY } from "../../../common/constants/application/use-case.constants.js";

/**
 * 用例装饰器
 *
 * @description 用于标记用例类并提供配置选项
 *
 * @param options - 用例配置选项
 * @returns 类装饰器函数
 *
 * @example
 * ```typescript
 * @UseCase({
 *   name: 'CreateUser',
 *   description: '创建用户用例',
 *   type: 'command',
 *   version: '1.0.0',
 *   permissions: ['user:create'],
 *   category: 'user-management',
 *   tags: ['core', 'user'],
 *   critical: true,
 *   monitored: true,
 *   timeout: { execution: 5000, alertOnTimeout: true }
 * })
 * export class CreateUserUseCase extends BaseCommandUseCase<CreateUserRequest, CreateUserResponse> {
 *   // 用例实现
 * }
 * ```
 */
export function UseCase(options: IUseCaseOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function <TFunction extends Function>(target: TFunction) {
    // 验证配置选项
    validateUseCaseOptions(options);

    // 设置默认值
    const metadata: IUseCaseOptions = {
      name: options.name,
      description: options.description,
      type: options.type as UseCaseType,
      version: options.version || "1.0.0",
      permissions: options.permissions || [],
      category: options.category || "general",
      tags: options.tags || [],
      critical: options.critical || false,
      monitored: options.monitored !== false, // 默认启用监控
      cacheable: options.cacheable || false,
      cacheTtl: options.cacheTtl || 300,
      timeout: options.timeout || 30000, // 默认30秒
    };

    // 存储元数据
    Reflect.defineMetadata(USE_CASE_METADATA_KEY, metadata, target);

    return target;
  };
}

/**
 * 获取用例元数据
 *
 * @description 从用例类中获取元数据信息
 *
 * @param target - 用例类或实例
 * @returns 用例元数据，如果没有找到返回undefined
 *
 * @example
 * ```typescript
 * const metadata = getUseCaseMetadata(CreateUserUseCase);
 * console.log(`用例名称: ${metadata?.name}`);
 * ```
 */
export function getUseCaseMetadata(
  target: ClassConstructor | object,
): Required<IUseCaseOptions> | undefined {
  const targetClass =
    typeof target === "function" ? target : target.constructor;
  return Reflect.getMetadata(USE_CASE_METADATA_KEY, targetClass);
}

/**
 * 检查类是否是用例
 *
 * @description 检查给定的类是否被@UseCase装饰器标记
 *
 * @param target - 要检查的类或实例
 * @returns 如果是用例返回true，否则返回false
 *
 * @example
 * ```typescript
 * if (isUseCase(CreateUserUseCase)) {
 *   console.log('这是一个用例');
 * }
 * ```
 */
export function isUseCase(target: unknown): boolean {
  return getUseCaseMetadata(target as ClassConstructor | object) !== undefined;
}

/**
 * 验证用例配置选项
 *
 * @param options - 要验证的配置选项
 * @throws {Error} 当配置选项无效时抛出错误
 */
function validateUseCaseOptions(options: IUseCaseOptions): void {
  if (
    !options.name ||
    typeof options.name !== "string" ||
    options.name.trim().length === 0
  ) {
    throw new ValidationException(
      "USE_CASE_NAME_REQUIRED",
      "用例名称不能为空",
      "用例名称不能为空",
      400,
    );
  }

  if (!options.description || typeof options.description !== "string") {
    throw new ValidationException(
      "USE_CASE_DESCRIPTION_REQUIRED",
      "用例描述不能为空",
      "用例描述不能为空",
      400,
    );
  }

  if (!options.type || !["command", "query"].includes(options.type as string)) {
    throw new ValidationException(
      "INVALID_USE_CASE_TYPE",
      '用例类型必须是 "command" 或 "query"',
      '用例类型必须是 "command" 或 "query"',
      400,
    );
  }

  if (options.version && typeof options.version !== "string") {
    throw new ValidationException(
      "INVALID_USE_CASE_VERSION",
      "用例版本必须是字符串",
      "用例版本必须是字符串",
      400,
    );
  }

  if (options.permissions && !Array.isArray(options.permissions)) {
    throw new ValidationException(
      "INVALID_USE_CASE_PERMISSIONS",
      "用例权限必须是字符串数组",
      "用例权限必须是字符串数组",
      400,
    );
  }

  if (
    options.permissions &&
    options.permissions.some((p) => typeof p !== "string")
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_PERMISSION_TYPE",
      "用例权限必须都是字符串",
      "用例权限必须都是字符串",
      400,
    );
  }

  if (options.category && typeof options.category !== "string") {
    throw new ValidationException(
      "INVALID_USE_CASE_CATEGORY",
      "用例分类必须是字符串",
      "用例分类必须是字符串",
      400,
    );
  }

  if (options.tags && !Array.isArray(options.tags)) {
    throw new ValidationException(
      "INVALID_USE_CASE_TAGS",
      "用例标签必须是字符串数组",
      "用例标签必须是字符串数组",
      400,
    );
  }

  if (options.tags && options.tags.some((tag) => typeof tag !== "string")) {
    throw new ValidationException(
      "INVALID_USE_CASE_TAG_TYPE",
      "用例标签必须都是字符串",
      "用例标签必须都是字符串",
      400,
    );
  }

  if (
    options.timeout &&
    (typeof options.timeout !== "number" || options.timeout <= 0)
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_TIMEOUT",
      "用例超时时间必须是正整数",
      "用例超时时间必须是正整数",
      400,
    );
  }

  if (
    options.cacheTtl &&
    (typeof options.cacheTtl !== "number" || options.cacheTtl <= 0)
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_CACHE_TTL",
      "缓存TTL必须是正整数",
      "缓存TTL必须是正整数",
      400,
    );
  }
}
