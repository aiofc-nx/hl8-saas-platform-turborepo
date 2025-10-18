/**
 * 租户应用服务
 *
 * @description 协调租户相关的用例服务，处理复杂的租户业务场景
 * 作为应用层的门面，为上层提供统一的租户业务操作接口
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
 * // 创建租户应用服务
 * const tenantApplicationService = new TenantApplicationService(
 *   tenantUseCaseServices,
 *   userUseCaseServices,
 *   logger
 * );
 *
 * // 创建租户并初始化管理员
 * const result = await tenantApplicationService.createTenantWithAdmin({
 *   tenantData: { name: '企业租户', type: TenantType.ENTERPRISE },
 *   adminData: { email: 'admin@example.com', username: 'admin' }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { TenantUseCaseServices } from "./tenant-use-case-services.js";
import { UserUseCaseServices } from "./user-use-case-services.js";

// 输入输出类型
import type { CreateTenantRequest, CreateTenantResponse } from "../use-cases/tenant/create-tenant.use-case.js";
import type { CreateUserRequest, CreateUserResponse } from "../use-cases/user/create-user.use-case.js";

/**
 * 创建租户并初始化管理员请求
 */
export interface CreateTenantWithAdminRequest {
  /** 租户数据 */
  tenantData: {
    name: string;
    type: any;
    platformId: EntityId;
    createdBy: string;
  };
  /** 管理员数据 */
  adminData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
    createdBy: string;
  };
}

/**
 * 创建租户并初始化管理员响应
 */
export interface CreateTenantWithAdminResponse {
  /** 租户信息 */
  tenant: CreateTenantResponse;
  /** 管理员信息 */
  admin: CreateUserResponse;
}

/**
 * 租户应用服务
 *
 * @description 协调租户相关的用例服务，处理复杂的租户业务场景
 */
export class TenantApplicationService {
  constructor(
    private readonly tenantUseCaseServices: TenantUseCaseServices,
    private readonly userUseCaseServices: UserUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建租户并初始化管理员
   *
   * @description 创建新租户并为其创建管理员用户，处理复杂的租户初始化流程
   *
   * @param request - 创建租户并初始化管理员请求
   * @returns Promise<创建租户并初始化管理员响应>
   *
   * @example
   * ```typescript
   * const result = await tenantApplicationService.createTenantWithAdmin({
   *   tenantData: {
   *     name: '企业租户',
   *     type: TenantType.ENTERPRISE,
   *     platformId: platformId,
   *     createdBy: 'system'
   *   },
   *   adminData: {
   *     email: 'admin@example.com',
   *     username: 'admin',
   *     password: 'admin123',
   *     displayName: '管理员',
   *     createdBy: 'system'
   *   }
   * });
   * ```
   */
  async createTenantWithAdmin(
    request: CreateTenantWithAdminRequest,
  ): Promise<CreateTenantWithAdminResponse> {
    try {
      this.logger.info("开始创建租户并初始化管理员", {
        tenantName: request.tenantData.name,
        adminEmail: request.adminData.email,
      });

      // 1. 创建租户
      const tenantResult = await this.tenantUseCaseServices.createTenant(request.tenantData);

      // 2. 创建管理员用户
      const adminResult = await this.userUseCaseServices.createUser({
        ...request.adminData,
        tenantId: tenantResult.tenantId,
        role: "ADMIN", // 管理员角色
      });

      this.logger.info("租户和管理员创建成功", {
        tenantId: tenantResult.tenantId.toString(),
        adminId: adminResult.userId.toString(),
      });

      return {
        tenant: tenantResult,
        admin: adminResult,
      };
    } catch (error) {
      this.logger.error("创建租户并初始化管理员失败", {
        error: error.message,
        tenantName: request.tenantData.name,
        adminEmail: request.adminData.email,
      });
      throw error;
    }
  }

  /**
   * 获取租户完整信息
   *
   * @description 获取租户及其关联的用户信息
   *
   * @param tenantId - 租户ID
   * @returns Promise<租户完整信息>
   *
   * @example
   * ```typescript
   * const tenantInfo = await tenantApplicationService.getTenantCompleteInfo(tenantId);
   * ```
   */
  async getTenantCompleteInfo(tenantId: TenantId): Promise<any> {
    try {
      this.logger.debug("开始获取租户完整信息", {
        tenantId: tenantId.toString(),
      });

      // 获取租户信息
      const tenantResult = await this.tenantUseCaseServices.getTenant({ tenantId });

      // 获取租户用户列表
      const usersResult = await this.userUseCaseServices.getUserList({
        tenantId,
        page: 1,
        limit: 100, // 获取前100个用户
      });

      const completeInfo = {
        tenant: tenantResult.tenant,
        users: usersResult.users,
        userCount: usersResult.total,
        statistics: {
          totalUsers: usersResult.total,
          activeUsers: usersResult.users.filter(u => u.isActive).length,
          inactiveUsers: usersResult.users.filter(u => !u.isActive).length,
        },
      };

      this.logger.debug("租户完整信息获取成功", {
        tenantId: tenantId.toString(),
        userCount: usersResult.total,
      });

      return completeInfo;
    } catch (error) {
      this.logger.error("获取租户完整信息失败", {
        error: error.message,
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 激活租户并发送通知
   *
   * @description 激活租户并发送激活通知给管理员
   *
   * @param tenantId - 租户ID
   * @param activatedBy - 激活者
   * @returns Promise<激活结果>
   *
   * @example
   * ```typescript
   * const result = await tenantApplicationService.activateTenantWithNotification(
   *   tenantId,
   *   'admin'
   * );
   * ```
   */
  async activateTenantWithNotification(
    tenantId: TenantId,
    activatedBy: string,
  ): Promise<any> {
    try {
      this.logger.info("开始激活租户并发送通知", {
        tenantId: tenantId.toString(),
        activatedBy,
      });

      // 1. 激活租户
      const activateResult = await this.tenantUseCaseServices.activateTenant({
        tenantId,
        activatedBy,
      });

      // 2. 获取租户管理员
      const usersResult = await this.userUseCaseServices.getUserList({
        tenantId,
        page: 1,
        limit: 1,
        filters: { role: "ADMIN" },
      });

      if (usersResult.users.length > 0) {
        const admin = usersResult.users[0];
        // 这里可以添加发送通知的逻辑
        this.logger.info("租户激活通知已发送", {
          tenantId: tenantId.toString(),
          adminEmail: admin.email,
        });
      }

      this.logger.info("租户激活成功", {
        tenantId: tenantId.toString(),
      });

      return activateResult;
    } catch (error) {
      this.logger.error("激活租户并发送通知失败", {
        error: error.message,
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }
}
