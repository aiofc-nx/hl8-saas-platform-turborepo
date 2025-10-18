/**
 * 组织用例服务集合
 *
 * @description 统一管理组织相关的所有用例服务，提供统一的组织业务操作接口
 * 遵循用例为中心的设计原则，每个用例服务都专注于一个具体的业务场景
 *
 * ## 业务规则
 *
 * ### 用例服务集合职责
 * - 统一管理组织相关的所有用例服务
 * - 提供统一的组织业务操作接口
 * - 协调多个用例服务完成复杂的业务场景
 * - 确保用例服务之间的一致性和协调性
 *
 * ### 用例服务协调规则
 * - 用例服务集合不包含业务逻辑，只负责协调
 * - 所有业务逻辑都在具体的用例服务中实现
 * - 用例服务集合负责参数转换和结果聚合
 * - 用例服务集合负责异常处理和日志记录
 *
 * ### 依赖注入规则
 * - 通过构造函数注入所有依赖的用例服务
 * - 使用接口类型进行依赖注入，确保松耦合
 * - 所有依赖都应该是可选的，支持部分功能
 * - 依赖注入应该支持测试时的模拟替换
 *
 * @example
 * ```typescript
 * // 创建组织用例服务集合
 * const organizationUseCaseServices = new OrganizationUseCaseServices(
 *   createOrganizationUseCase,
 *   updateOrganizationUseCase,
 *   deleteOrganizationUseCase,
 *   getOrganizationUseCase,
 *   getOrganizationsUseCase,
 *   activateOrganizationUseCase,
 *   deactivateOrganizationUseCase
 * );
 *
 * // 创建组织
 * const result = await organizationUseCaseServices.createOrganization({
 *   name: '技术部门',
 *   type: OrganizationType.DEPARTMENT,
 *   tenantId: tenantId,
 *   createdBy: 'admin'
 * });
 *
 * console.log('组织创建成功:', result.organizationId);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 用例服务接口
import type { ICreateOrganizationUseCase } from "../use-cases/organization/create-organization.use-case.js";
import type { IUpdateOrganizationUseCase } from "../use-cases/organization/update-organization.use-case.js";
import type { IDeleteOrganizationUseCase } from "../use-cases/organization/delete-organization.use-case.js";
import type { IGetOrganizationUseCase } from "../use-cases/organization/get-organization.use-case.js";
import type { IGetOrganizationsUseCase } from "../use-cases/organization/get-organizations.use-case.js";
import type { IActivateOrganizationUseCase } from "../use-cases/organization/activate-organization.use-case.js";
import type { IDeactivateOrganizationUseCase } from "../use-cases/organization/deactivate-organization.use-case.js";

// 输入输出类型
import type { CreateOrganizationRequest, CreateOrganizationResponse } from "../use-cases/organization/create-organization.use-case.js";
import type { UpdateOrganizationRequest, UpdateOrganizationResponse } from "../use-cases/organization/update-organization.use-case.js";
import type { DeleteOrganizationRequest, DeleteOrganizationResponse } from "../use-cases/organization/delete-organization.use-case.js";
import type { GetOrganizationRequest, GetOrganizationResponse } from "../use-cases/organization/get-organization.use-case.js";
import type { GetOrganizationsRequest, GetOrganizationsResponse } from "../use-cases/organization/get-organizations.use-case.js";
import type { ActivateOrganizationRequest, ActivateOrganizationResponse } from "../use-cases/organization/activate-organization.use-case.js";
import type { DeactivateOrganizationRequest, DeactivateOrganizationResponse } from "../use-cases/organization/deactivate-organization.use-case.js";

/**
 * 组织用例服务集合
 *
 * @description 统一管理组织相关的所有用例服务，提供统一的组织业务操作接口
 */
export class OrganizationUseCaseServices {
  constructor(
    private readonly createOrganizationUseCase: ICreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: IUpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: IDeleteOrganizationUseCase,
    private readonly getOrganizationUseCase: IGetOrganizationUseCase,
    private readonly getOrganizationsUseCase: IGetOrganizationsUseCase,
    private readonly activateOrganizationUseCase: IActivateOrganizationUseCase,
    private readonly deactivateOrganizationUseCase: IDeactivateOrganizationUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建组织
   *
   * @description 创建新组织，包括验证、持久化和事件发布
   *
   * @param request - 创建组织请求
   * @returns Promise<创建组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.createOrganization({
   *   name: '技术部门',
   *   type: OrganizationType.DEPARTMENT,
   *   tenantId: tenantId,
   *   createdBy: 'admin'
   * });
   * ```
   */
  async createOrganization(request: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
    try {
      this.logger.info("开始创建组织", { name: request.name, type: request.type.value });
      
      const response = await this.createOrganizationUseCase.execute(request);
      
      this.logger.info("组织创建成功", { organizationId: response.organizationId.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织创建失败", { error: error.message, name: request.name });
      throw error;
    }
  }

  /**
   * 更新组织
   *
   * @description 更新组织信息，包括验证、持久化和事件发布
   *
   * @param request - 更新组织请求
   * @returns Promise<更新组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.updateOrganization({
   *   organizationId: organizationId,
   *   name: '新组织名称',
   *   type: OrganizationType.TEAM,
   *   updatedBy: 'admin'
   * });
   * ```
   */
  async updateOrganization(request: UpdateOrganizationRequest): Promise<UpdateOrganizationResponse> {
    try {
      this.logger.info("开始更新组织", { organizationId: request.organizationId.toString() });
      
      const response = await this.updateOrganizationUseCase.execute(request);
      
      this.logger.info("组织更新成功", { organizationId: response.organizationId.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织更新失败", { error: error.message, organizationId: request.organizationId.toString() });
      throw error;
    }
  }

  /**
   * 删除组织
   *
   * @description 删除组织，包括验证、持久化和事件发布
   *
   * @param request - 删除组织请求
   * @returns Promise<删除组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.deleteOrganization({
   *   organizationId: organizationId,
   *   deletedBy: 'admin',
   *   deleteReason: '组织重组'
   * });
   * ```
   */
  async deleteOrganization(request: DeleteOrganizationRequest): Promise<DeleteOrganizationResponse> {
    try {
      this.logger.info("开始删除组织", { organizationId: request.organizationId.toString() });
      
      const response = await this.deleteOrganizationUseCase.execute(request);
      
      this.logger.info("组织删除成功", { organizationId: response.organizationId.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织删除失败", { error: error.message, organizationId: request.organizationId.toString() });
      throw error;
    }
  }

  /**
   * 获取组织
   *
   * @description 获取组织详细信息
   *
   * @param request - 获取组织请求
   * @returns Promise<获取组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.getOrganization({
   *   organizationId: organizationId
   * });
   * ```
   */
  async getOrganization(request: GetOrganizationRequest): Promise<GetOrganizationResponse> {
    try {
      this.logger.debug("开始获取组织", { organizationId: request.organizationId.toString() });
      
      const response = await this.getOrganizationUseCase.execute(request);
      
      this.logger.debug("组织获取成功", { organizationId: response.organization.id.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织获取失败", { error: error.message, organizationId: request.organizationId.toString() });
      throw error;
    }
  }

  /**
   * 获取组织列表
   *
   * @description 获取组织列表，支持分页、过滤和排序
   *
   * @param request - 获取组织列表请求
   * @returns Promise<获取组织列表响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.getOrganizations({
   *   tenantId: tenantId,
   *   page: 1,
   *   limit: 20,
   *   filters: { type: OrganizationType.DEPARTMENT }
   * });
   * ```
   */
  async getOrganizations(request: GetOrganizationsRequest): Promise<GetOrganizationsResponse> {
    try {
      this.logger.debug("开始获取组织列表", { 
        tenantId: request.tenantId.toString(),
        page: request.page,
        limit: request.limit
      });
      
      const response = await this.getOrganizationsUseCase.execute(request);
      
      this.logger.debug("组织列表获取成功", { 
        total: response.total,
        count: response.organizations.length
      });
      return response;
    } catch (error) {
      this.logger.error("组织列表获取失败", { 
        error: error.message, 
        tenantId: request.tenantId.toString() 
      });
      throw error;
    }
  }

  /**
   * 激活组织
   *
   * @description 激活组织账户
   *
   * @param request - 激活组织请求
   * @returns Promise<激活组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.activateOrganization({
   *   organizationId: organizationId,
   *   activatedBy: 'admin'
   * });
   * ```
   */
  async activateOrganization(request: ActivateOrganizationRequest): Promise<ActivateOrganizationResponse> {
    try {
      this.logger.info("开始激活组织", { organizationId: request.organizationId.toString() });
      
      const response = await this.activateOrganizationUseCase.execute(request);
      
      this.logger.info("组织激活成功", { organizationId: response.organizationId.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织激活失败", { error: error.message, organizationId: request.organizationId.toString() });
      throw error;
    }
  }

  /**
   * 停用组织
   *
   * @description 停用组织账户
   *
   * @param request - 停用组织请求
   * @returns Promise<停用组织响应>
   *
   * @example
   * ```typescript
   * const result = await organizationUseCaseServices.deactivateOrganization({
   *   organizationId: organizationId,
   *   deactivatedBy: 'admin',
   *   deactivateReason: '组织解散'
   * });
   * ```
   */
  async deactivateOrganization(request: DeactivateOrganizationRequest): Promise<DeactivateOrganizationResponse> {
    try {
      this.logger.info("开始停用组织", { organizationId: request.organizationId.toString() });
      
      const response = await this.deactivateOrganizationUseCase.execute(request);
      
      this.logger.info("组织停用成功", { organizationId: response.organizationId.toString() });
      return response;
    } catch (error) {
      this.logger.error("组织停用失败", { error: error.message, organizationId: request.organizationId.toString() });
      throw error;
    }
  }
}
