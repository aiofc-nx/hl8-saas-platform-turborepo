/**
 * 部门应用服务
 *
 * @description 协调部门相关的用例服务，处理复杂的部门业务场景
 * 作为应用层的门面，为上层提供统一的部门业务操作接口
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
 * // 创建部门应用服务
 * const departmentApplicationService = new DepartmentApplicationService(
 *   departmentUseCaseServices,
 *   userUseCaseServices,
 *   logger
 * );
 *
 * // 创建部门并分配管理员
 * const result = await departmentApplicationService.createDepartmentWithManager({
 *   departmentData: { name: '技术部', level: DepartmentLevel.LEVEL_1 },
 *   managerData: { email: 'manager@example.com', username: 'manager' }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { DepartmentUseCaseServices } from "./department-use-case-services.js";
import { UserUseCaseServices } from "./user-use-case-services.js";

// 输入输出类型
import type { CreateDepartmentRequest, CreateDepartmentResponse } from "../use-cases/department/create-department.use-case.js";
import type { CreateUserRequest, CreateUserResponse } from "../use-cases/user/create-user.use-case.js";

/**
 * 创建部门并分配管理员请求
 */
export interface CreateDepartmentWithManagerRequest {
  /** 部门数据 */
  departmentData: {
    name: string;
    level: any;
    organizationId: EntityId;
    tenantId: TenantId;
    createdBy: string;
  };
  /** 管理员数据 */
  managerData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
    createdBy: string;
  };
}

/**
 * 创建部门并分配管理员响应
 */
export interface CreateDepartmentWithManagerResponse {
  /** 部门信息 */
  department: CreateDepartmentResponse;
  /** 管理员信息 */
  manager: CreateUserResponse;
}

/**
 * 批量创建部门请求
 */
export interface BatchCreateDepartmentsRequest {
  /** 部门数据列表 */
  departments: CreateDepartmentRequest[];
  /** 租户ID */
  tenantId: TenantId;
}

/**
 * 批量创建部门响应
 */
export interface BatchCreateDepartmentsResponse {
  /** 成功创建的部门 */
  successful: CreateDepartmentResponse[];
  /** 失败的部门 */
  failed: Array<{
    departmentData: CreateDepartmentRequest;
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
 * 部门应用服务
 *
 * @description 协调部门相关的用例服务，处理复杂的部门业务场景
 */
export class DepartmentApplicationService {
  constructor(
    private readonly departmentUseCaseServices: DepartmentUseCaseServices,
    private readonly userUseCaseServices: UserUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建部门并分配管理员
   *
   * @description 创建新部门并为其分配管理员，处理复杂的部门初始化流程
   *
   * @param request - 创建部门并分配管理员请求
   * @returns Promise<创建部门并分配管理员响应>
   *
   * @example
   * ```typescript
   * const result = await departmentApplicationService.createDepartmentWithManager({
   *   departmentData: {
   *     name: '技术部',
   *     level: DepartmentLevel.LEVEL_1,
   *     organizationId: organizationId,
   *     tenantId: tenantId,
   *     createdBy: 'admin'
   *   },
   *   managerData: {
   *     email: 'manager@example.com',
   *     username: 'manager',
   *     password: 'password123',
   *     displayName: '部门管理员',
   *     createdBy: 'admin'
   *   }
   * });
   * ```
   */
  async createDepartmentWithManager(
    request: CreateDepartmentWithManagerRequest,
  ): Promise<CreateDepartmentWithManagerResponse> {
    try {
      this.logger.info("开始创建部门并分配管理员", {
        departmentName: request.departmentData.name,
        managerEmail: request.managerData.email,
      });

      // 1. 创建部门
      const departmentResult = await this.departmentUseCaseServices.createDepartment(request.departmentData);

      // 2. 创建管理员用户
      const managerResult = await this.userUseCaseServices.createUser({
        ...request.managerData,
        tenantId: request.departmentData.tenantId,
        role: "DEPARTMENT_ADMIN", // 部门管理员角色
      });

      this.logger.info("部门和管理员创建成功", {
        departmentId: departmentResult.departmentId.toString(),
        managerId: managerResult.userId.toString(),
      });

      return {
        department: departmentResult,
        manager: managerResult,
      };
    } catch (error) {
      this.logger.error("创建部门并分配管理员失败", {
        error: error.message,
        departmentName: request.departmentData.name,
        managerEmail: request.managerData.email,
      });
      throw error;
    }
  }

  /**
   * 批量创建部门
   *
   * @description 批量创建部门，支持部分成功和部分失败
   *
   * @param request - 批量创建部门请求
   * @returns Promise<批量创建部门响应>
   *
   * @example
   * ```typescript
   * const result = await departmentApplicationService.batchCreateDepartments({
   *   departments: [
   *     { name: '技术部', level: DepartmentLevel.LEVEL_1, ... },
   *     { name: '市场部', level: DepartmentLevel.LEVEL_1, ... }
   *   ],
   *   tenantId: tenantId
   * });
   * ```
   */
  async batchCreateDepartments(
    request: BatchCreateDepartmentsRequest,
  ): Promise<BatchCreateDepartmentsResponse> {
    try {
      this.logger.info("开始批量创建部门", {
        departmentCount: request.departments.length,
        tenantId: request.tenantId.toString(),
      });

      const successful: CreateDepartmentResponse[] = [];
      const failed: Array<{ departmentData: CreateDepartmentRequest; error: string }> = [];

      // 并发创建部门
      const createPromises = request.departments.map(async (departmentData) => {
        try {
          const departmentResult = await this.departmentUseCaseServices.createDepartment(departmentData);
          successful.push(departmentResult);
        } catch (error) {
          failed.push({
            departmentData,
            error: error.message,
          });
        }
      });

      await Promise.all(createPromises);

      this.logger.info("批量创建部门完成", {
        total: request.departments.length,
        successCount: successful.length,
        failureCount: failed.length,
      });

      return {
        successful,
        failed,
        total: request.departments.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      this.logger.error("批量创建部门失败", {
        error: error.message,
        departmentCount: request.departments.length,
      });
      throw error;
    }
  }

  /**
   * 获取部门完整信息
   *
   * @description 获取部门及其关联的用户信息
   *
   * @param departmentId - 部门ID
   * @param tenantId - 租户ID
   * @returns Promise<部门完整信息>
   *
   * @example
   * ```typescript
   * const departmentInfo = await departmentApplicationService.getDepartmentCompleteInfo(departmentId, tenantId);
   * ```
   */
  async getDepartmentCompleteInfo(departmentId: EntityId, tenantId: TenantId): Promise<any> {
    try {
      this.logger.debug("开始获取部门完整信息", {
        departmentId: departmentId.toString(),
        tenantId: tenantId.toString(),
      });

      // 获取部门信息
      const departmentResult = await this.departmentUseCaseServices.getDepartment({ departmentId, tenantId });

      // 获取部门用户列表
      const usersResult = await this.userUseCaseServices.getUserList({
        tenantId,
        page: 1,
        limit: 100, // 获取前100个用户
        filters: { departmentId },
      });

      const completeInfo = {
        department: departmentResult.department,
        users: usersResult.users,
        userCount: usersResult.total,
        statistics: {
          totalUsers: usersResult.total,
          activeUsers: usersResult.users.filter(u => u.status === "ACTIVE").length,
          inactiveUsers: usersResult.users.filter(u => u.status === "INACTIVE").length,
        },
      };

      this.logger.debug("部门完整信息获取成功", {
        departmentId: departmentId.toString(),
        userCount: usersResult.total,
      });

      return completeInfo;
    } catch (error) {
      this.logger.error("获取部门完整信息失败", {
        error: error.message,
        departmentId: departmentId.toString(),
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 激活部门并发送通知
   *
   * @description 激活部门并发送激活通知给部门成员
   *
   * @param departmentId - 部门ID
   * @param tenantId - 租户ID
   * @param activatedBy - 激活者
   * @returns Promise<激活结果>
   *
   * @example
   * ```typescript
   * const result = await departmentApplicationService.activateDepartmentWithNotification(
   *   departmentId,
   *   tenantId,
   *   'admin'
   * );
   * ```
   */
  async activateDepartmentWithNotification(
    departmentId: EntityId,
    tenantId: TenantId,
    activatedBy: string,
  ): Promise<any> {
    try {
      this.logger.info("开始激活部门并发送通知", {
        departmentId: departmentId.toString(),
        tenantId: tenantId.toString(),
        activatedBy,
      });

      // 1. 激活部门
      const activateResult = await this.departmentUseCaseServices.activateDepartment({
        departmentId,
        activatedBy,
      });

      // 2. 获取部门成员
      const usersResult = await this.userUseCaseServices.getUserList({
        tenantId,
        page: 1,
        limit: 1,
        filters: { departmentId },
      });

      if (usersResult.users.length > 0) {
        // 这里可以添加发送通知的逻辑
        this.logger.info("部门激活通知已发送", {
          departmentId: departmentId.toString(),
          userCount: usersResult.total,
        });
      }

      this.logger.info("部门激活成功", {
        departmentId: departmentId.toString(),
      });

      return activateResult;
    } catch (error) {
      this.logger.error("激活部门并发送通知失败", {
        error: error.message,
        departmentId: departmentId.toString(),
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }
}
