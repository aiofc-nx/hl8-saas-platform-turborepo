/**
 * 用户应用服务
 *
 * @description 协调用户相关的用例服务，处理复杂的用户业务场景
 * 作为应用层的门面，为上层提供统一的用户业务操作接口
 *
 * ## 业务规则
 *
 * ### 应用服务职责
 * - 协调多个用例服务完成复杂的业务场景
 * - 处理跨用例的业务逻辑
 * - 提供统一的业务操作接口
 * - 管理业务事务边界
 *
 * ### 业务协调规则
 * - 应用服务不包含具体的业务逻辑，只负责协调
 * - 所有业务逻辑都在用例服务中实现
 * - 应用服务负责参数转换和结果聚合
 * - 应用服务负责异常处理和日志记录
 *
 * ### 事务管理规则
 * - 应用服务负责管理业务事务边界
 * - 跨用例的操作应该在同一个事务中
 * - 事务失败时应该回滚所有变更
 * - 事务成功时应该提交所有变更
 *
 * @example
 * ```typescript
 * // 创建用户应用服务
 * const userApplicationService = new UserApplicationService(
 *   userUseCaseServices,
 *   tenantUseCaseServices,
 *   logger
 * );
 *
 * // 创建用户并分配租户
 * const result = await userApplicationService.createUserWithTenant({
 *   userData: { email: 'user@example.com', username: 'testuser' },
 *   tenantData: { name: '企业租户', type: TenantType.ENTERPRISE }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { UserUseCaseServices } from "./user-use-case-services.js";
import { TenantUseCaseServices } from "./tenant-use-case-services.js";

// 输入输出类型
import type { CreateUserRequest, CreateUserResponse } from "../use-cases/user/create-user.use-case.js";
import type { CreateTenantRequest, CreateTenantResponse } from "../use-cases/tenant/create-tenant.use-case.js";

/**
 * 创建用户并分配租户请求
 */
export interface CreateUserWithTenantRequest {
  /** 用户数据 */
  userData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
    role: string;
    createdBy: string;
  };
  /** 租户数据 */
  tenantData: {
    name: string;
    type: string;
    platformId: EntityId;
    createdBy: string;
  };
}

/**
 * 创建用户并分配租户响应
 */
export interface CreateUserWithTenantResponse {
  /** 用户信息 */
  user: CreateUserResponse;
  /** 租户信息 */
  tenant: CreateTenantResponse;
}

/**
 * 批量创建用户请求
 */
export interface BatchCreateUsersRequest {
  /** 用户数据列表 */
  users: CreateUserRequest[];
  /** 租户ID */
  tenantId: TenantId;
}

/**
 * 批量创建用户响应
 */
export interface BatchCreateUsersResponse {
  /** 成功创建的用户 */
  successful: CreateUserResponse[];
  /** 失败的用户 */
  failed: Array<{
    userData: CreateUserRequest;
    error: string;
  }>;
  /** 总数 */
  total: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
}

/**
 * 用户应用服务
 *
 * @description 协调用户相关的用例服务，处理复杂的用户业务场景
 */
export class UserApplicationService {
  constructor(
    private readonly userUseCaseServices: UserUseCaseServices,
    private readonly tenantUseCaseServices: TenantUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建用户并分配租户
   *
   * @description 创建新用户并为其分配租户，处理复杂的用户注册流程
   *
   * @param request - 创建用户并分配租户请求
   * @returns Promise<创建用户并分配租户响应>
   *
   * @example
   * ```typescript
   * const result = await userApplicationService.createUserWithTenant({
   *   userData: {
   *     email: 'user@example.com',
   *     username: 'testuser',
   *     password: 'password123',
   *     displayName: '测试用户',
   *     role: UserRole.USER,
   *     createdBy: 'admin'
   *   },
   *   tenantData: {
   *     name: '企业租户',
   *     type: TenantType.ENTERPRISE,
   *     platformId: platformId,
   *     createdBy: 'admin'
   *   }
   * });
   * ```
   */
  async createUserWithTenant(
    request: CreateUserWithTenantRequest,
  ): Promise<CreateUserWithTenantResponse> {
    try {
      this.logger.info("开始创建用户并分配租户", {
        email: request.userData.email,
        tenantName: request.tenantData.name,
      });

      // 1. 创建租户
      const tenantResult = await this.tenantUseCaseServices.createTenant(request.tenantData);

      // 2. 创建用户并关联租户
      const userResult = await this.userUseCaseServices.createUser({
        ...request.userData,
        tenantId: tenantResult.tenantId,
      });

      this.logger.info("用户和租户创建成功", {
        userId: userResult.userId.toString(),
        tenantId: tenantResult.tenantId.toString(),
      });

      return {
        user: userResult,
        tenant: tenantResult,
      };
    } catch (error) {
      this.logger.error("创建用户并分配租户失败", {
        error: error.message,
        email: request.userData.email,
        tenantName: request.tenantData.name,
      });
      throw error;
    }
  }

  /**
   * 批量创建用户
   *
   * @description 批量创建用户，支持部分成功和部分失败
   *
   * @param request - 批量创建用户请求
   * @returns Promise<批量创建用户响应>
   *
   * @example
   * ```typescript
   * const result = await userApplicationService.batchCreateUsers({
   *   users: [
   *     { email: 'user1@example.com', username: 'user1', ... },
   *     { email: 'user2@example.com', username: 'user2', ... }
   *   ],
   *   tenantId: tenantId
   * });
   * ```
   */
  async batchCreateUsers(
    request: BatchCreateUsersRequest,
  ): Promise<BatchCreateUsersResponse> {
    try {
      this.logger.info("开始批量创建用户", {
        userCount: request.users.length,
        tenantId: request.tenantId.toString(),
      });

      const successful: CreateUserResponse[] = [];
      const failed: Array<{ userData: CreateUserRequest; error: string }> = [];

      // 并发创建用户
      const createPromises = request.users.map(async (userData) => {
        try {
          const userResult = await this.userUseCaseServices.createUser({
            ...userData,
            tenantId: request.tenantId,
          });
          successful.push(userResult);
        } catch (error) {
          failed.push({
            userData,
            error: error.message,
          });
        }
      });

      await Promise.all(createPromises);

      this.logger.info("批量创建用户完成", {
        total: request.users.length,
        successCount: successful.length,
        failureCount: failed.length,
      });

      return {
        successful,
        failed,
        total: request.users.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      this.logger.error("批量创建用户失败", {
        error: error.message,
        userCount: request.users.length,
      });
      throw error;
    }
  }

  /**
   * 获取用户完整信息
   *
   * @description 获取用户及其关联的租户信息
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns Promise<用户完整信息>
   *
   * @example
   * ```typescript
   * const userInfo = await userApplicationService.getUserCompleteInfo(userId, tenantId);
   * ```
   */
  async getUserCompleteInfo(userId: EntityId, tenantId: TenantId): Promise<any> {
    try {
      this.logger.debug("开始获取用户完整信息", {
        userId: userId.toString(),
        tenantId: tenantId.toString(),
      });

      // 并发获取用户和租户信息
      const [userResult, tenantResult] = await Promise.all([
        this.userUseCaseServices.getUser({ userId, tenantId }),
        this.tenantUseCaseServices.getTenant({ tenantId }),
      ]);

      const completeInfo = {
        user: userResult.user,
        tenant: tenantResult.tenant,
        permissions: [], // 这里可以添加权限信息
        roles: [], // 这里可以添加角色信息
      };

      this.logger.debug("用户完整信息获取成功", {
        userId: userId.toString(),
        tenantId: tenantId.toString(),
      });

      return completeInfo;
    } catch (error) {
      this.logger.error("获取用户完整信息失败", {
        error: error.message,
        userId: userId.toString(),
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }
}
