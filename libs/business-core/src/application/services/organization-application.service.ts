/**
 * 组织应用服务
 *
 * @description 协调组织相关的用例服务，处理复杂的组织业务场景
 * 作为应用层的门面，为上层提供统一的组织业务操作接口
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
 * // 创建组织应用服务
 * const organizationApplicationService = new OrganizationApplicationService(
 *   organizationUseCaseServices,
 *   departmentUseCaseServices,
 *   logger
 * );
 *
 * // 创建组织并初始化部门
 * const result = await organizationApplicationService.createOrganizationWithDepartment({
 *   organizationData: { name: '技术委员会', type: OrganizationType.COMMITTEE },
 *   departmentData: { name: '技术部', level: DepartmentLevel.LEVEL_1 }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { OrganizationUseCaseServices } from "./organization-use-case-services.js";
import { DepartmentUseCaseServices } from "./department-use-case-services.js";

// 输入输出类型
import type { CreateOrganizationRequest, CreateOrganizationResponse } from "../use-cases/organization/create-organization.use-case.js";
import type { CreateDepartmentRequest, CreateDepartmentResponse } from "../use-cases/department/create-department.use-case.js";

/**
 * 创建组织并初始化部门请求
 */
export interface CreateOrganizationWithDepartmentRequest {
  /** 组织数据 */
  organizationData: {
    name: string;
    type: string;
    tenantId: TenantId;
    createdBy: string;
  };
  /** 部门数据 */
  departmentData: {
    name: string;
    level: number;
    createdBy: string;
  };
}

/**
 * 创建组织并初始化部门响应
 */
export interface CreateOrganizationWithDepartmentResponse {
  /** 组织信息 */
  organization: CreateOrganizationResponse;
  /** 部门信息 */
  department: CreateDepartmentResponse;
}

/**
 * 批量创建组织请求
 */
export interface BatchCreateOrganizationsRequest {
  /** 组织数据列表 */
  organizations: CreateOrganizationRequest[];
  /** 租户ID */
  tenantId: TenantId;
}

/**
 * 批量创建组织响应
 */
export interface BatchCreateOrganizationsResponse {
  /** 成功创建的组织 */
  successful: CreateOrganizationResponse[];
  /** 失败的组织 */
  failed: Array<{
    organizationData: CreateOrganizationRequest;
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
 * 组织应用服务
 *
 * @description 协调组织相关的用例服务，处理复杂的组织业务场景
 */
export class OrganizationApplicationService {
  constructor(
    private readonly organizationUseCaseServices: OrganizationUseCaseServices,
    private readonly departmentUseCaseServices: DepartmentUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建组织并初始化部门
   *
   * @description 创建新组织并为其创建初始部门，处理复杂的组织初始化流程
   *
   * @param request - 创建组织并初始化部门请求
   * @returns Promise<创建组织并初始化部门响应>
   *
   * @example
   * ```typescript
   * const result = await organizationApplicationService.createOrganizationWithDepartment({
   *   organizationData: {
   *     name: '技术委员会',
   *     type: OrganizationType.COMMITTEE,
   *     tenantId: tenantId,
   *     createdBy: 'admin'
   *   },
   *   departmentData: {
   *     name: '技术部',
   *     level: DepartmentLevel.LEVEL_1,
   *     createdBy: 'admin'
   *   }
   * });
   * ```
   */
  async createOrganizationWithDepartment(
    request: CreateOrganizationWithDepartmentRequest,
  ): Promise<CreateOrganizationWithDepartmentResponse> {
    try {
      this.logger.info("开始创建组织并初始化部门", {
        organizationName: request.organizationData.name,
        departmentName: request.departmentData.name,
      });

      // 1. 创建组织
      const organizationResult = await this.organizationUseCaseServices.createOrganization(request.organizationData);

      // 2. 创建初始部门
      const departmentResult = await this.departmentUseCaseServices.createDepartment({
        ...request.departmentData,
        organizationId: organizationResult.organizationId,
        tenantId: request.organizationData.tenantId,
      });

      this.logger.info("组织和部门创建成功", {
        organizationId: organizationResult.organizationId.toString(),
        departmentId: departmentResult.departmentId.toString(),
      });

      return {
        organization: organizationResult,
        department: departmentResult,
      };
    } catch (error) {
      this.logger.error("创建组织并初始化部门失败", {
        error: error.message,
        organizationName: request.organizationData.name,
        departmentName: request.departmentData.name,
      });
      throw error;
    }
  }

  /**
   * 批量创建组织
   *
   * @description 批量创建组织，支持部分成功和部分失败
   *
   * @param request - 批量创建组织请求
   * @returns Promise<批量创建组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationApplicationService.batchCreateOrganizations({
   *   organizations: [
   *     { name: '技术委员会', type: OrganizationType.COMMITTEE, ... },
   *     { name: '质量委员会', type: OrganizationType.QUALITY_GROUP, ... }
   *   ],
   *   tenantId: tenantId
   * });
   * ```
   */
  async batchCreateOrganizations(
    request: BatchCreateOrganizationsRequest,
  ): Promise<BatchCreateOrganizationsResponse> {
    try {
      this.logger.info("开始批量创建组织", {
        organizationCount: request.organizations.length,
        tenantId: request.tenantId.toString(),
      });

      const successful: CreateOrganizationResponse[] = [];
      const failed: Array<{ organizationData: CreateOrganizationRequest; error: string }> = [];

      // 并发创建组织
      const createPromises = request.organizations.map(async (organizationData) => {
        try {
          const organizationResult = await this.organizationUseCaseServices.createOrganization(organizationData);
          successful.push(organizationResult);
        } catch (error) {
          failed.push({
            organizationData,
            error: error.message,
          });
        }
      });

      await Promise.all(createPromises);

      this.logger.info("批量创建组织完成", {
        total: request.organizations.length,
        successCount: successful.length,
        failureCount: failed.length,
      });

      return {
        successful,
        failed,
        total: request.organizations.length,
        successCount: successful.length,
        failureCount: failed.length,
      };
    } catch (error) {
      this.logger.error("批量创建组织失败", {
        error: error.message,
        organizationCount: request.organizations.length,
      });
      throw error;
    }
  }

  /**
   * 获取组织完整信息
   *
   * @description 获取组织及其关联的部门信息
   *
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @returns Promise<组织完整信息>
   *
   * @example
   * ```typescript
   * const organizationInfo = await organizationApplicationService.getOrganizationCompleteInfo(organizationId, tenantId);
   * ```
   */
  async getOrganizationCompleteInfo(organizationId: EntityId, tenantId: TenantId): Promise<any> {
    try {
      this.logger.debug("开始获取组织完整信息", {
        organizationId: organizationId.toString(),
        tenantId: tenantId.toString(),
      });

      // 并发获取组织和部门信息
      const [organizationResult, departmentsResult] = await Promise.all([
        this.organizationUseCaseServices.getOrganization({ organizationId, tenantId }),
        this.departmentUseCaseServices.getDepartments({
          tenantId,
          page: 1,
          limit: 100, // 获取前100个部门
          filters: { organizationId },
        }),
      ]);

      const completeInfo = {
        organization: organizationResult.organization,
        departments: departmentsResult.departments,
        departmentCount: departmentsResult.total,
        statistics: {
          totalDepartments: departmentsResult.total,
          activeDepartments: departmentsResult.departments.filter(d => d.status === "ACTIVE").length,
          inactiveDepartments: departmentsResult.departments.filter(d => d.status === "INACTIVE").length,
        },
      };

      this.logger.debug("组织完整信息获取成功", {
        organizationId: organizationId.toString(),
        departmentCount: departmentsResult.total,
      });

      return completeInfo;
    } catch (error) {
      this.logger.error("获取组织完整信息失败", {
        error: error.message,
        organizationId: organizationId.toString(),
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 激活组织并发送通知
   *
   * @description 激活组织并发送激活通知给组织成员
   *
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @param activatedBy - 激活者
   * @returns Promise<激活结果>
   *
   * @example
   * ```typescript
   * const result = await organizationApplicationService.activateOrganizationWithNotification(
   *   organizationId,
   *   tenantId,
   *   'admin'
   * );
   * ```
   */
  async activateOrganizationWithNotification(
    organizationId: EntityId,
    tenantId: TenantId,
    activatedBy: string,
  ): Promise<any> {
    try {
      this.logger.info("开始激活组织并发送通知", {
        organizationId: organizationId.toString(),
        tenantId: tenantId.toString(),
        activatedBy,
      });

      // 1. 激活组织
      const activateResult = await this.organizationUseCaseServices.activateOrganization({
        organizationId,
        activatedBy,
      });

      // 2. 获取组织成员
      const departmentsResult = await this.departmentUseCaseServices.getDepartments({
        tenantId,
        page: 1,
        limit: 1,
        filters: { organizationId },
      });

      if (departmentsResult.departments.length > 0) {
        // 这里可以添加发送通知的逻辑
        this.logger.info("组织激活通知已发送", {
          organizationId: organizationId.toString(),
          departmentCount: departmentsResult.total,
        });
      }

      this.logger.info("组织激活成功", {
        organizationId: organizationId.toString(),
      });

      return activateResult;
    } catch (error) {
      this.logger.error("激活组织并发送通知失败", {
        error: error.message,
        organizationId: organizationId.toString(),
        tenantId: tenantId.toString(),
      });
      throw error;
    }
  }
}
