/**
 * 租户查询处理器
 *
 * @description 处理租户相关的查询，包括获取租户信息、租户列表等操作
 *
 * ## 业务规则
 *
 * ### 查询处理规则
 * - 每个查询处理器只处理一种类型的查询
 * - 查询处理器应该验证查询参数的有效性
 * - 查询处理器应该优化查询性能
 * - 查询处理器应该支持缓存
 *
 * ### 查询验证规则
 * - 验证查询参数的有效性
 * - 验证权限和访问控制
 * - 验证数据访问范围
 * - 验证查询复杂度
 *
 * ### 查询执行规则
 * - 查询执行应该是幂等的
 * - 查询执行应该支持缓存
 * - 查询执行应该优化性能
 * - 查询执行应该支持分页
 *
 * @example
 * ```typescript
 * // 获取租户查询处理器
 * const handler = new GetTenantQueryHandler(getTenantUseCase, logger);
 *
 * // 处理获取租户查询
 * const result = await handler.handle(getTenantQuery);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { IGetTenantUseCase } from "../../../use-cases/tenant/get-tenant.use-case.js";
import type { IGetTenantsUseCase } from "../../../use-cases/tenant/get-tenants.use-case.js";

// 查询类型
import { GetTenantQuery } from "../../queries/tenant-queries.js";
import { GetTenantsQuery } from "../../queries/tenant-queries.js";

// 输入输出类型
import type {
  GetTenantRequest,
  GetTenantResponse,
} from "../../../use-cases/tenant/get-tenant.use-case.js";
import type {
  GetTenantsRequest,
  GetTenantsResponse,
} from "../../../use-cases/tenant/get-tenants.use-case.js";

/**
 * 获取租户查询处理器
 *
 * @description 处理获取租户信息的查询
 */
export class GetTenantQueryHandler {
  constructor(
    private readonly getTenantUseCase: IGetTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理获取租户查询
   *
   * @param query - 获取租户查询
   * @returns Promise<获取租户结果>
   */
  async handle(query: GetTenantQuery): Promise<GetTenantResponse> {
    try {
      this.logger.debug("开始处理获取租户查询", {
        tenantId: query.tenantId.toString(),
      });

      const request: GetTenantRequest = {
        tenantId: query.tenantId,
      };

      const response = await this.getTenantUseCase.execute(request);

      this.logger.debug("获取租户查询处理成功", {
        tenantId: response.tenant.id.toString(),
        name: response.tenant.name,
      });

      return response;
    } catch (error) {
      this.logger.error("获取租户查询处理失败", {
        error: error.message,
        tenantId: query.tenantId.toString(),
      });
      throw error;
    }
  }
}

/**
 * 获取租户列表查询处理器
 *
 * @description 处理获取租户列表的查询
 */
export class GetTenantsQueryHandler {
  constructor(
    private readonly getTenantsUseCase: IGetTenantsUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理获取租户列表查询
   *
   * @param query - 获取租户列表查询
   * @returns Promise<获取租户列表结果>
   */
  async handle(query: GetTenantsQuery): Promise<GetTenantsResponse> {
    try {
      this.logger.debug("开始处理获取租户列表查询", {
        platformId: query.platformId?.toString(),
        page: query.page,
        limit: query.limit,
        filters: query.filters,
      });

      const request: GetTenantsRequest = {
        platformId: query.platformId,
        type: query.type,
        name: query.name,
        includeDeleted: query.includeDeleted,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };

      const response = await this.getTenantsUseCase.execute(request);

      this.logger.debug("获取租户列表查询处理成功", {
        total: response.total,
        count: response.tenants.length,
        page: response.page,
        limit: response.limit,
      });

      return response;
    } catch (error) {
      this.logger.error("获取租户列表查询处理失败", {
        error: error.message,
        platformId: query.platformId?.toString(),
      });
      throw error;
    }
  }
}
