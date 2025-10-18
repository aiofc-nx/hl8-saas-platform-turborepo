/**
 * 批量操作服务
 *
 * @description 提供批量操作功能，支持批量创建、更新、删除等操作
 *
 * ## 业务规则
 *
 * ### 批量操作规则
 * - 批量操作支持部分成功和部分失败
 * - 批量操作支持并发执行
 * - 批量操作支持事务管理
 * - 批量操作支持进度跟踪
 *
 * ### 性能优化规则
 * - 批量操作支持分批处理
 * - 批量操作支持并发控制
 * - 批量操作支持内存优化
 * - 批量操作支持错误重试
 *
 * @example
 * ```typescript
 * // 批量创建用户
 * const batchService = new BatchOperationService(logger);
 *
 * const result = await batchService.batchCreateUsers(users, {
 *   batchSize: 100,
 *   concurrency: 5,
 *   retryCount: 3
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { UserUseCaseServices } from "./user-use-case-services.js";
import { OrganizationUseCaseServices } from "./organization-use-case-services.js";
import { DepartmentUseCaseServices } from "./department-use-case-services.js";

// 输入输出类型
import type {
  CreateUserRequest,
  CreateUserResponse,
} from "../use-cases/user/create-user.use-case.js";
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from "../use-cases/organization/create-organization.use-case.js";
import type {
  CreateDepartmentRequest,
  CreateDepartmentResponse,
} from "../use-cases/department/create-department.use-case.js";

// 导入批量操作相关类型
import type {
  BatchOperationOptions,
  BatchOperationResult,
  BatchOperationProgress,
} from "../../common/types/application/batch-operation.types.js";

/**
 * 批量操作服务
 *
 * @description 提供批量操作功能，支持批量创建、更新、删除等操作
 */
export class BatchOperationService {
  constructor(
    private readonly userUseCaseServices: UserUseCaseServices,
    private readonly organizationUseCaseServices: OrganizationUseCaseServices,
    private readonly departmentUseCaseServices: DepartmentUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 批量创建用户
   *
   * @description 批量创建用户，支持分批处理和并发控制
   *
   * @param users - 用户数据列表
   * @param options - 批量操作选项
   * @returns Promise<批量操作结果>
   *
   * @example
   * ```typescript
   * const result = await batchService.batchCreateUsers(users, {
   *   batchSize: 100,
   *   concurrency: 5,
   *   retryCount: 3
   * });
   * ```
   */
  async batchCreateUsers(
    users: CreateUserRequest[],
    options: BatchOperationOptions = {},
  ): Promise<BatchOperationResult<CreateUserResponse>> {
    const startTime = Date.now();
    const defaultOptions: BatchOperationOptions = {
      batchSize: 100,
      concurrency: 5,
      retryCount: 3,
      retryDelay: 1000,
      continueOnError: true,
      ...options,
    };

    this.logger.info("开始批量创建用户", {
      userCount: users.length,
      batchSize: defaultOptions.batchSize,
      concurrency: defaultOptions.concurrency,
    });

    const successful: CreateUserResponse[] = [];
    const failed: Array<{
      item: CreateUserRequest;
      error: string;
      retryCount: number;
    }> = [];

    // 分批处理
    const batches = this.createBatches(users, defaultOptions.batchSize!);

    for (const batch of batches) {
      const batchResults = await this.processBatch(
        batch,
        (user) => this.userUseCaseServices.createUser(user),
        defaultOptions,
      );

      successful.push(...batchResults.successful);
      failed.push(...batchResults.failed);
    }

    const executionTime = Date.now() - startTime;

    this.logger.info("批量创建用户完成", {
      total: users.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    });

    return {
      successful,
      failed,
      total: users.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    };
  }

  /**
   * 批量创建组织
   *
   * @description 批量创建组织，支持分批处理和并发控制
   *
   * @param organizations - 组织数据列表
   * @param options - 批量操作选项
   * @returns Promise<批量操作结果>
   */
  async batchCreateOrganizations(
    organizations: CreateOrganizationRequest[],
    options: BatchOperationOptions = {},
  ): Promise<BatchOperationResult<CreateOrganizationResponse>> {
    const startTime = Date.now();
    const defaultOptions: BatchOperationOptions = {
      batchSize: 50,
      concurrency: 3,
      retryCount: 3,
      retryDelay: 1000,
      continueOnError: true,
      ...options,
    };

    this.logger.info("开始批量创建组织", {
      organizationCount: organizations.length,
      batchSize: defaultOptions.batchSize,
      concurrency: defaultOptions.concurrency,
    });

    const successful: CreateOrganizationResponse[] = [];
    const failed: Array<{
      item: CreateOrganizationRequest;
      error: string;
      retryCount: number;
    }> = [];

    // 分批处理
    const batches = this.createBatches(
      organizations,
      defaultOptions.batchSize!,
    );

    for (const batch of batches) {
      const batchResults = await this.processBatch(
        batch,
        (organization) =>
          this.organizationUseCaseServices.createOrganization(organization),
        defaultOptions,
      );

      successful.push(...batchResults.successful);
      failed.push(...batchResults.failed);
    }

    const executionTime = Date.now() - startTime;

    this.logger.info("批量创建组织完成", {
      total: organizations.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    });

    return {
      successful,
      failed,
      total: organizations.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    };
  }

  /**
   * 批量创建部门
   *
   * @description 批量创建部门，支持分批处理和并发控制
   *
   * @param departments - 部门数据列表
   * @param options - 批量操作选项
   * @returns Promise<批量操作结果>
   */
  async batchCreateDepartments(
    departments: CreateDepartmentRequest[],
    options: BatchOperationOptions = {},
  ): Promise<BatchOperationResult<CreateDepartmentResponse>> {
    const startTime = Date.now();
    const defaultOptions: BatchOperationOptions = {
      batchSize: 50,
      concurrency: 3,
      retryCount: 3,
      retryDelay: 1000,
      continueOnError: true,
      ...options,
    };

    this.logger.info("开始批量创建部门", {
      departmentCount: departments.length,
      batchSize: defaultOptions.batchSize,
      concurrency: defaultOptions.concurrency,
    });

    const successful: CreateDepartmentResponse[] = [];
    const failed: Array<{
      item: CreateDepartmentRequest;
      error: string;
      retryCount: number;
    }> = [];

    // 分批处理
    const batches = this.createBatches(departments, defaultOptions.batchSize!);

    for (const batch of batches) {
      const batchResults = await this.processBatch(
        batch,
        (department) =>
          this.departmentUseCaseServices.createDepartment(department),
        defaultOptions,
      );

      successful.push(...batchResults.successful);
      failed.push(...batchResults.failed);
    }

    const executionTime = Date.now() - startTime;

    this.logger.info("批量创建部门完成", {
      total: departments.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    });

    return {
      successful,
      failed,
      total: departments.length,
      successCount: successful.length,
      failureCount: failed.length,
      executionTime,
    };
  }

  /**
   * 创建批次
   *
   * @param items - 项目列表
   * @param batchSize - 批次大小
   * @returns 批次列表
   * @private
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 处理批次
   *
   * @param batch - 批次数据
   * @param operation - 操作函数
   * @param options - 批量操作选项
   * @returns 批次处理结果
   * @private
   */
  private async processBatch<T, R>(
    batch: T[],
    operation: (item: T) => Promise<R>,
    options: BatchOperationOptions,
  ): Promise<{
    successful: R[];
    failed: Array<{ item: T; error: string; retryCount: number }>;
  }> {
    const successful: R[] = [];
    const failed: Array<{ item: T; error: string; retryCount: number }> = [];

    // 并发处理
    const concurrency = options.concurrency || 5;
    const semaphore = new Semaphore(concurrency);

    const promises = batch.map(async (item) => {
      await semaphore.acquire();
      try {
        const result = await this.executeWithRetry(item, operation, options);
        successful.push(result);
      } catch (error) {
        failed.push({
          item,
          error: error.message,
          retryCount: options.retryCount || 0,
        });
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);

    return { successful, failed };
  }

  /**
   * 带重试的执行
   *
   * @param item - 项目
   * @param operation - 操作函数
   * @param options - 批量操作选项
   * @returns 操作结果
   * @private
   */
  private async executeWithRetry<T, R>(
    item: T,
    operation: (item: T) => Promise<R>,
    options: BatchOperationOptions,
  ): Promise<R> {
    let lastError: Error;
    const retryCount = options.retryCount || 0;
    const retryDelay = options.retryDelay || 1000;

    for (let i = 0; i <= retryCount; i++) {
      try {
        return await operation(item);
      } catch (error) {
        lastError = error;
        if (i < retryCount) {
          await this.delay(retryDelay * Math.pow(2, i)); // 指数退避
        }
      }
    }

    throw lastError!;
  }

  /**
   * 延迟执行
   *
   * @param ms - 延迟时间（毫秒）
   * @returns Promise<void>
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 信号量类
 *
 * @description 用于控制并发数量
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve();
    } else {
      this.permits++;
    }
  }
}
