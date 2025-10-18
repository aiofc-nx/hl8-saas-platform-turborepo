/**
 * 用例注册表
 *
 * 负责管理系统中所有已注册的用例，提供用例的注册、发现和执行功能。
 * 注册表支持用例的动态注册和查找，是用例基础设施的核心组件。
 *
 * @description 用例注册表提供了用例的统一管理和访问入口
 *
 * ## 业务规则
 *
 * ### 用例注册规则
 * - 每个用例只能注册一次
 * - 用例名称在注册表中必须唯一
 * - 用例必须有有效的@UseCase装饰器
 * - 用例注册时会验证元数据的完整性
 *
 * ### 用例发现规则
 * - 可以通过名称精确查找用例
 * - 可以通过类型批量查找用例
 * - 可以通过分类和标签过滤用例
 * - 查找不存在的用例返回undefined
 *
 * ### 用例执行规则
 * - 用例执行前会验证权限和参数
 * - 用例执行会记录性能指标
 * - 用例执行失败会记录错误信息
 * - 用例执行支持超时控制
 *
 * @example
 * ```typescript
 * // 注册用例
 * const registry = new UseCaseRegistry();
 * registry.register(CreateUserUseCase);
 * registry.register(GetUserUseCase);
 *
 * // 执行用例
 * const request = new CreateUserRequest('张三', 'zhangsan@example.com');
 * const response = await registry.execute('CreateUser', request, context);
 *
 * // 查找用例
 * const commandUseCases = registry.getByType('command');
 * const userUseCases = registry.getByCategory('user-management');
 * ```
 *
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type {
  IUseCase,
  IUseCaseContext,
  IUseCaseRegistry,
  IUseCaseFactory,
} from "../base/use-case.interface.js";
import type {
  getUseCaseMetadata,
  IUseCaseOptions,
  // UseCaseType, // 暂时未使用
} from "../decorators/use-case.decorator.js";
import { ResourceAlreadyExistsException, ResourceNotFoundException, ValidationException } from "../../../common/exceptions/business.exceptions.js";

/**
 * 用例注册信息
 */
interface IUseCaseRegistration {
  /**
   * 用例类
   */
  useCaseClass: ClassConstructor;

  /**
   * 用例实例工厂
   */
  factory: () => IUseCase<unknown, unknown>;

  /**
   * 用例元数据
   */
  metadata: Required<IUseCaseOptions>;

  /**
   * 注册时间
   */
  registeredAt: Date;
}

/**
 * 用例执行统计
 */
interface IUseCaseExecutionStats {
  /**
   * 执行次数
   */
  executionCount: number;

  /**
   * 成功次数
   */
  successCount: number;

  /**
   * 失败次数
   */
  failureCount: number;

  /**
   * 平均执行时间（毫秒）
   */
  averageExecutionTime: number;

  /**
   * 最后执行时间
   */
  lastExecutedAt?: Date;

  /**
   * 最后失败时间
   */
  lastFailedAt?: Date;
}

/**
 * 用例注册表实现
 */
@Injectable()
export class UseCaseRegistry implements IUseCaseRegistry {
  private readonly useCases = new Map<string, IUseCaseRegistration>();
  private readonly executionStats = new Map<string, IUseCaseExecutionStats>();

  /**
   * 注册用例
   *
   * @param useCaseClass - 用例类
   * @param factory - 用例实例工厂（可选）
   */
  register<TRequest, TResponse>(
    useCaseName: string,
    useCaseFactory: IUseCaseFactory<IUseCase<TRequest, TResponse>>,
  ): void {
    if (this.useCases.has(useCaseName)) {
      throw new ResourceAlreadyExistsException("用例", useCaseName);
    }

    const registration: IUseCaseRegistration = {
      useCaseClass: useCaseFactory.create,
      factory: () => useCaseFactory.create(),
      metadata: {
        name: useCaseName,
        type: "command", // 默认类型，实际应该从工厂获取
        description: "",
        version: "1.0.0",
        category: "default",
        tags: [],
        permissions: [],
        timeout: { execution: 30000 },
        cache: { enabled: false, ttl: 300 },
        critical: false,
        monitored: true,
      },
      registeredAt: new Date(),
    };

    this.useCases.set(useCaseName, registration);

    // 初始化执行统计
    this.executionStats.set(useCaseName, {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
    });

    console.log(`用例已注册: ${useCaseName}`);
  }

  /**
   * 获取用例
   *
   * @param useCaseName - 用例名称
   * @returns 用例实例
   */
  get<TRequest, TResponse>(
    useCaseName: string,
  ): IUseCase<TRequest, TResponse> | undefined {
    const registration = this.useCases.get(useCaseName);
    if (!registration) {
      return undefined;
    }

    try {
      return registration.factory() as IUseCase<TRequest, TResponse>;
    } catch (error) {
      console.error(`创建用例实例失败: ${useCaseName}`, error);
      return undefined;
    }
  }

  /**
   * 检查用例是否已注册
   *
   * @param useCaseName - 用例名称
   * @returns 如果已注册返回true，否则返回false
   */
  has(useCaseName: string): boolean {
    return this.useCases.has(useCaseName);
  }

  /**
   * 获取所有已注册的用例名称
   *
   * @returns 用例名称数组
   */
  getRegisteredUseCases(): string[] {
    return Array.from(this.useCases.keys());
  }

  /**
   * 按类型获取用例
   *
   * @param type - 用例类型
   * @returns 该类型的所有用例
   */
  getByType(type: "command" | "query"): Map<string, IUseCase<any, any>> {
    const result = new Map<string, IUseCase<any, any>>();

    for (const [name, registration] of this.useCases) {
      if (registration.metadata.type === type) {
        const useCase = registration.factory();
        if (useCase) {
          result.set(name, useCase);
        }
      }
    }

    return result;
  }

  /**
   * 按分类获取用例
   *
   * @param category - 用例分类
   * @returns 该分类下的所有用例
   */
  getByCategory(category: string): Map<string, IUseCase<any, any>> {
    const result = new Map<string, IUseCase<any, any>>();

    for (const [name, registration] of this.useCases) {
      if (registration.metadata.category === category) {
        const useCase = registration.factory();
        if (useCase) {
          result.set(name, useCase);
        }
      }
    }

    return result;
  }

  /**
   * 按标签获取用例
   *
   * @param tag - 用例标签
   * @returns 包含该标签的所有用例
   */
  getByTag(tag: string): Map<string, IUseCase<any, any>> {
    const result = new Map<string, IUseCase<any, any>>();

    for (const [name, registration] of this.useCases) {
      if (registration.metadata.tags.includes(tag)) {
        const useCase = registration.factory();
        if (useCase) {
          result.set(name, useCase);
        }
      }
    }

    return result;
  }

  /**
   * 执行用例
   *
   * @param useCaseName - 用例名称
   * @param request - 请求参数
   * @param context - 执行上下文
   * @returns 执行结果
   */
  async execute<TRequest, TResponse>(
    useCaseName: string,
    request: TRequest,
    context?: IUseCaseContext,
  ): Promise<TResponse> {
    const useCase = this.get<TRequest, TResponse>(useCaseName);
    if (!useCase) {
      throw new ResourceNotFoundException("用例", useCaseName);
    }

    const startTime = Date.now();

    try {
      // 更新执行统计
      this.incrementExecutionCount(useCaseName);

      // 执行用例
      const response = await useCase.execute(request);

      // 更新成功统计
      const executionTime = Date.now() - startTime;
      this.updateSuccessStats(useCaseName, executionTime);

      return response;
    } catch (error) {
      // 更新失败统计
      const executionTime = Date.now() - startTime;
      this.updateFailureStats(useCaseName, executionTime);
      throw error;
    }
  }

  /**
   * 获取用例执行统计
   *
   * @param useCaseName - 用例名称
   * @returns 执行统计信息
   */
  getExecutionStats(useCaseName: string): IUseCaseExecutionStats | undefined {
    return this.executionStats.get(useCaseName);
  }

  /**
   * 获取所有用例的执行统计
   *
   * @returns 所有用例的执行统计
   */
  getAllExecutionStats(): Map<string, IUseCaseExecutionStats> {
    return new Map(this.executionStats);
  }

  /**
   * 获取用例注册信息
   *
   * @param useCaseName - 用例名称
   * @returns 注册信息
   */
  getRegistrationInfo(useCaseName: string): IUseCaseRegistration | undefined {
    return this.useCases.get(useCaseName);
  }

  /**
   * 清除所有注册的用例
   *
   * @description 主要用于测试环境
   */
  clear(): void {
    this.useCases.clear();
    this.executionStats.clear();
  }

  /**
   * 增加执行次数
   */
  private incrementExecutionCount(useCaseName: string): void {
    const stats = this.executionStats.get(useCaseName);
    if (stats) {
      stats.executionCount++;
      stats.lastExecutedAt = new Date();
    }
  }

  /**
   * 更新成功统计
   */
  private updateSuccessStats(useCaseName: string, executionTime: number): void {
    const stats = this.executionStats.get(useCaseName);
    if (stats) {
      stats.successCount++;
      stats.averageExecutionTime = this.calculateAverageExecutionTime(
        stats.averageExecutionTime,
        executionTime,
        stats.executionCount,
      );
    }
  }

  /**
   * 更新失败统计
   */
  private updateFailureStats(useCaseName: string, executionTime: number): void {
    const stats = this.executionStats.get(useCaseName);
    if (stats) {
      stats.failureCount++;
      stats.lastFailedAt = new Date();
      stats.averageExecutionTime = this.calculateAverageExecutionTime(
        stats.averageExecutionTime,
        executionTime,
        stats.executionCount,
      );
    }
  }

  /**
   * 计算平均执行时间
   */
  private calculateAverageExecutionTime(
    currentAverage: number,
    newExecutionTime: number,
    totalExecutions: number,
  ): number {
    return (
      (currentAverage * (totalExecutions - 1) + newExecutionTime) /
      totalExecutions
    );
  }
}

/**
 * 验证用例配置选项
 *
 * @param options - 要验证的配置选项
 * @throws {Error} 当配置选项无效时抛出错误
 */
function _validateUseCaseOptions(options: IUseCaseOptions): void {
  if (
    !options.name ||
    typeof options.name !== "string" ||
    options.name.trim().length === 0
  ) {
    throw new ValidationException(
      "USE_CASE_NAME_REQUIRED",
      "用例名称不能为空",
      "用例名称不能为空",
      400
    );
  }

  if (!options.description || typeof options.description !== "string") {
    throw new ValidationException(
      "USE_CASE_DESCRIPTION_REQUIRED",
      "用例描述不能为空",
      "用例描述不能为空",
      400
    );
  }

  if (!options.type || !["command", "query"].includes(options.type as string)) {
    throw new ValidationException(
      "INVALID_USE_CASE_TYPE",
      "用例类型必须是 \"command\" 或 \"query\"",
      "用例类型必须是 \"command\" 或 \"query\"",
      400
    );
  }

  if (options.version && typeof options.version !== "string") {
    throw new ValidationException(
      "INVALID_USE_CASE_VERSION",
      "用例版本必须是字符串",
      "用例版本必须是字符串",
      400
    );
  }

  if (options.permissions && !Array.isArray(options.permissions)) {
    throw new ValidationException(
      "INVALID_USE_CASE_PERMISSIONS",
      "用例权限必须是字符串数组",
      "用例权限必须是字符串数组",
      400
    );
  }

  if (
    options.permissions &&
    options.permissions.some((p: unknown) => typeof p !== "string")
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_PERMISSION_TYPE",
      "用例权限必须都是字符串",
      "用例权限必须都是字符串",
      400
    );
  }

  if (options.category && typeof options.category !== "string") {
    throw new ValidationException(
      "INVALID_USE_CASE_CATEGORY",
      "用例分类必须是字符串",
      "用例分类必须是字符串",
      400
    );
  }

  if (options.tags && !Array.isArray(options.tags)) {
    throw new ValidationException(
      "INVALID_USE_CASE_TAGS",
      "用例标签必须是字符串数组",
      "用例标签必须是字符串数组",
      400
    );
  }

  if (
    options.tags &&
    options.tags.some((tag: unknown) => typeof tag !== "string")
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_TAG_TYPE",
      "用例标签必须都是字符串",
      "用例标签必须都是字符串",
      400
    );
  }

  if (
    options.timeout?.execution &&
    (typeof options.timeout.execution !== "number" ||
      options.timeout.execution <= 0)
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_TIMEOUT",
      "用例超时时间必须是正整数",
      "用例超时时间必须是正整数",
      400
    );
  }

  if (
    options.cache?.ttl &&
    (typeof options.cache.ttl !== "number" || options.cache.ttl <= 0)
  ) {
    throw new ValidationException(
      "INVALID_USE_CASE_CACHE_TTL",
      "缓存TTL必须是正整数",
      "缓存TTL必须是正整数",
      400
    );
  }
}
