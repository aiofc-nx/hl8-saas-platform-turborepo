/**
 * 租户用例服务集合
 *
 * @description 统一管理租户相关的所有用例服务，提供统一的租户业务操作接口
 * 遵循用例为中心的设计原则，每个用例服务都专注于一个具体的业务场景
 *
 * ## 业务规则
 *
 * ### 用例服务集合职责
 * - 统一管理租户相关的所有用例服务
 * - 提供统一的租户业务操作接口
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
 * // 创建租户用例服务集合
 * const tenantUseCaseServices = new TenantUseCaseServices(
 *   createTenantUseCase,
 *   updateTenantUseCase,
 *   deleteTenantUseCase,
 *   getTenantUseCase,
 *   getTenantsUseCase,
 *   activateTenantUseCase,
 *   deactivateTenantUseCase
 * );
 *
 * // 创建租户
 * const result = await tenantUseCaseServices.createTenant({
 *   name: '企业租户',
 *   type: TenantType.ENTERPRISE,
 *   platformId: platformId,
 *   createdBy: 'admin'
 * });
 *
 * console.log('租户创建成功:', result.tenantId);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 用例服务接口
import type { ICreateTenantUseCase } from "../use-cases/tenant/create-tenant.use-case.js";
import type { IUpdateTenantUseCase } from "../use-cases/tenant/update-tenant.use-case.js";
import type { IDeleteTenantUseCase } from "../use-cases/tenant/delete-tenant.use-case.js";
import type { IGetTenantUseCase } from "../use-cases/tenant/get-tenant.use-case.js";
import type { IGetTenantsUseCase } from "../use-cases/tenant/get-tenants.use-case.js";
import type { IActivateTenantUseCase } from "../use-cases/tenant/activate-tenant.use-case.js";
import type { IDeactivateTenantUseCase } from "../use-cases/tenant/deactivate-tenant.use-case.js";

// 输入输出类型
import type {
  CreateTenantRequest,
  CreateTenantResponse,
} from "../use-cases/tenant/create-tenant.use-case.js";
import type {
  UpdateTenantRequest,
  UpdateTenantResponse,
} from "../use-cases/tenant/update-tenant.use-case.js";
import type {
  DeleteTenantRequest,
  DeleteTenantResponse,
} from "../use-cases/tenant/delete-tenant.use-case.js";
import type {
  GetTenantRequest,
  GetTenantResponse,
} from "../use-cases/tenant/get-tenant.use-case.js";
import type {
  GetTenantsRequest,
  GetTenantsResponse,
} from "../use-cases/tenant/get-tenants.use-case.js";
import type {
  ActivateTenantRequest,
  ActivateTenantResponse,
} from "../use-cases/tenant/activate-tenant.use-case.js";
import type {
  DeactivateTenantRequest,
  DeactivateTenantResponse,
} from "../use-cases/tenant/deactivate-tenant.use-case.js";

/**
 * 租户用例服务集合
 *
 * @description 统一管理租户相关的所有用例服务，提供统一的租户业务操作接口
 */
export class TenantUseCaseServices {
  constructor(
    private readonly createTenantUseCase: ICreateTenantUseCase,
    private readonly updateTenantUseCase: IUpdateTenantUseCase,
    private readonly deleteTenantUseCase: IDeleteTenantUseCase,
    private readonly getTenantUseCase: IGetTenantUseCase,
    private readonly getTenantsUseCase: IGetTenantsUseCase,
    private readonly activateTenantUseCase: IActivateTenantUseCase,
    private readonly deactivateTenantUseCase: IDeactivateTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建租户
   *
   * @description 创建新租户，包括验证、持久化和事件发布
   *
   * @param request - 创建租户请求
   * @returns Promise<创建租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.createTenant({
   *   name: '企业租户',
   *   type: TenantType.ENTERPRISE,
   *   platformId: platformId,
   *   createdBy: 'admin'
   * });
   * ```
   */
  async createTenant(
    request: CreateTenantRequest,
  ): Promise<CreateTenantResponse> {
    try {
      this.logger.info("开始创建租户", {
        name: request.name,
        type: request.type.value,
      });

      const response = await this.createTenantUseCase.execute(request);

      this.logger.info("租户创建成功", {
        tenantId: response.tenantId.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户创建失败", {
        error: error.message,
        name: request.name,
      });
      throw error;
    }
  }

  /**
   * 更新租户
   *
   * @description 更新租户信息，包括验证、持久化和事件发布
   *
   * @param request - 更新租户请求
   * @returns Promise<更新租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.updateTenant({
   *   tenantId: tenantId,
   *   name: '新租户名称',
   *   type: TenantType.COMMUNITY,
   *   updatedBy: 'admin'
   * });
   * ```
   */
  async updateTenant(
    request: UpdateTenantRequest,
  ): Promise<UpdateTenantResponse> {
    try {
      this.logger.info("开始更新租户", {
        tenantId: request.tenantId.toString(),
      });

      const response = await this.updateTenantUseCase.execute(request);

      this.logger.info("租户更新成功", {
        tenantId: response.tenantId.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户更新失败", {
        error: error.message,
        tenantId: request.tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 删除租户
   *
   * @description 删除租户，包括验证、持久化和事件发布
   *
   * @param request - 删除租户请求
   * @returns Promise<删除租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.deleteTenant({
   *   tenantId: tenantId,
   *   deletedBy: 'admin',
   *   deleteReason: '租户请求删除'
   * });
   * ```
   */
  async deleteTenant(
    request: DeleteTenantRequest,
  ): Promise<DeleteTenantResponse> {
    try {
      this.logger.info("开始删除租户", {
        tenantId: request.tenantId.toString(),
      });

      const response = await this.deleteTenantUseCase.execute(request);

      this.logger.info("租户删除成功", {
        tenantId: response.tenantId.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户删除失败", {
        error: error.message,
        tenantId: request.tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 获取租户
   *
   * @description 获取租户详细信息
   *
   * @param request - 获取租户请求
   * @returns Promise<获取租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.getTenant({
   *   tenantId: tenantId
   * });
   * ```
   */
  async getTenant(request: GetTenantRequest): Promise<GetTenantResponse> {
    try {
      this.logger.debug("开始获取租户", {
        tenantId: request.tenantId.toString(),
      });

      const response = await this.getTenantUseCase.execute(request);

      this.logger.debug("租户获取成功", {
        tenantId: response.tenant.id.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户获取失败", {
        error: error.message,
        tenantId: request.tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 获取租户列表
   *
   * @description 获取租户列表，支持分页、过滤和排序
   *
   * @param request - 获取租户列表请求
   * @returns Promise<获取租户列表响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.getTenants({
   *   platformId: platformId,
   *   page: 1,
   *   limit: 20,
   *   filters: { type: TenantType.ENTERPRISE }
   * });
   * ```
   */
  async getTenants(request: GetTenantsRequest): Promise<GetTenantsResponse> {
    try {
      this.logger.debug("开始获取租户列表", {
        platformId: request.platformId?.toString(),
        page: request.page,
        limit: request.limit,
      });

      const response = await this.getTenantsUseCase.execute(request);

      this.logger.debug("租户列表获取成功", {
        total: response.total,
        count: response.tenants.length,
      });
      return response;
    } catch (error) {
      this.logger.error("租户列表获取失败", {
        error: error.message,
        platformId: request.platformId?.toString(),
      });
      throw error;
    }
  }

  /**
   * 激活租户
   *
   * @description 激活租户账户
   *
   * @param request - 激活租户请求
   * @returns Promise<激活租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.activateTenant({
   *   tenantId: tenantId,
   *   activatedBy: 'admin'
   * });
   * ```
   */
  async activateTenant(
    request: ActivateTenantRequest,
  ): Promise<ActivateTenantResponse> {
    try {
      this.logger.info("开始激活租户", {
        tenantId: request.tenantId.toString(),
      });

      const response = await this.activateTenantUseCase.execute(request);

      this.logger.info("租户激活成功", {
        tenantId: response.tenantId.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户激活失败", {
        error: error.message,
        tenantId: request.tenantId.toString(),
      });
      throw error;
    }
  }

  /**
   * 停用租户
   *
   * @description 停用租户账户
   *
   * @param request - 停用租户请求
   * @returns Promise<停用租户响应>
   *
   * @example
   * ```typescript
   * const result = await tenantUseCaseServices.deactivateTenant({
   *   tenantId: tenantId,
   *   deactivatedBy: 'admin',
   *   deactivateReason: '违反使用条款'
   * });
   * ```
   */
  async deactivateTenant(
    request: DeactivateTenantRequest,
  ): Promise<DeactivateTenantResponse> {
    try {
      this.logger.info("开始停用租户", {
        tenantId: request.tenantId.toString(),
      });

      const response = await this.deactivateTenantUseCase.execute(request);

      this.logger.info("租户停用成功", {
        tenantId: response.tenantId.toString(),
      });
      return response;
    } catch (error) {
      this.logger.error("租户停用失败", {
        error: error.message,
        tenantId: request.tenantId.toString(),
      });
      throw error;
    }
  }
}
