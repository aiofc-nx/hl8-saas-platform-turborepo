import { EntityId, TenantId } from "@hl8/isolation-model";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import { BaseQueryUseCase } from "../base/base-query-use-case.js";
import { UseCase } from "../decorators/use-case.decorator.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import { BusinessRuleViolationError } from "../base/base-command-use-case.js";
import type { IPureLogger } from "@hl8/pure-logger";

/**
 * 租户查询选项
 */
export interface TenantQueryOptions {
  platformId?: EntityId;
  type?: TenantType;
  name?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "type" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * 租户信息
 */
export interface TenantInfo {
  tenantId: EntityId;
  name: string;
  type: TenantType;
  platformId: EntityId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

/**
 * 租户查询响应
 */
export interface GetTenantsResponse {
  tenants: TenantInfo[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 获取租户用例
 *
 * @description 实现平台管理员查询租户的业务用例，包括租户列表查询、过滤、分页等功能。
 * 继承自BaseQueryUseCase，使用基础设施提供的通用功能。
 *
 * ## 业务规则
 *
 * ### 查询权限规则
 * - 平台管理员可以查询所有租户
 * - 租户管理员只能查询自己租户的信息
 * - 查询结果必须符合数据隔离规则
 *
 * ### 查询过滤规则
 * - 支持按平台ID过滤
 * - 支持按租户类型过滤
 * - 支持按租户名称模糊搜索
 * - 支持包含或排除已删除的租户
 *
 * ### 分页和排序规则
 * - 支持分页查询，默认每页20条记录
 * - 支持按名称、类型、创建时间、更新时间排序
 * - 支持升序和降序排列
 * - 最大每页限制100条记录
 *
 * @example
 * ```typescript
 * // 创建用例实例
 * const getTenantsUseCase = new GetTenantsUseCase(
 *   tenantRepository,
 *   logger
 * );
 *
 * // 执行查询租户
 * const result = await getTenantsUseCase.execute({
 *   platformId: platformId,
 *   type: TenantType.ENTERPRISE,
 *   page: 1,
 *   limit: 20
 * });
 *
 * console.log(`找到 ${result.total} 个租户`);
 * ```
 *
 * @since 1.0.0
 */
@UseCase({
  name: "GetTenants",
  description: "获取租户列表用例，包括过滤、分页和排序",
  type: "query",
  permissions: ["tenant:read"],
  category: "tenant-management",
  critical: false,
  monitored: true,
  version: "1.0.0",
})
export class GetTenantsUseCase extends BaseQueryUseCase<
  TenantQueryOptions,
  GetTenantsResponse
> {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly _logger: IPureLogger,
  ) {
    super("GetTenants", "获取租户列表用例", "1.0.0", ["tenant:read"]);
  }

  /**
   * 执行租户查询
   *
   * @description 查询租户列表，包括过滤、分页和排序
   * 继承自BaseQueryUseCase，自动处理验证、日志记录、错误处理等
   *
   * @param options - 查询选项
   * @param context - 用例执行上下文
   * @returns Promise<租户查询响应>
   *
   * @protected
   */
  protected async executeQuery(
    options: TenantQueryOptions,
    _context: IUseCaseContext,
  ): Promise<GetTenantsResponse> {
    // 验证查询选项
    this.validateQueryOptions(options);

    // 设置默认值
    const queryOptions = this.setDefaultOptions(options);

    // 执行查询
    const { tenants, total } =
      await this.tenantRepository.findMany(queryOptions);

    // 转换为响应格式
    const tenantInfos = tenants.map((tenant) => this.mapToTenantInfo(tenant));

    // 计算分页信息
    const hasNext = queryOptions.page * queryOptions.limit < total;
    const hasPrev = queryOptions.page > 1;

    return {
      tenants: tenantInfos,
      total,
      page: queryOptions.page,
      limit: queryOptions.limit,
      hasNext,
      hasPrev,
    };
  }

  /**
   * 验证查询选项
   *
   * @description 验证租户查询选项的有效性
   *
   * @param options - 查询选项
   * @throws {BusinessRuleViolationError} 当选项无效时
   * @private
   */
  private validateQueryOptions(options: TenantQueryOptions): void {
    if (options.page !== undefined && options.page < 1) {
      throw new BusinessRuleViolationError("页码必须大于0");
    }

    if (
      options.limit !== undefined &&
      (options.limit < 1 || options.limit > 100)
    ) {
      throw new BusinessRuleViolationError("每页记录数必须在1-100之间");
    }

    if (
      options.sortBy &&
      !["name", "type", "createdAt", "updatedAt"].includes(options.sortBy)
    ) {
      throw new BusinessRuleViolationError("无效的排序字段");
    }

    if (options.sortOrder && !["asc", "desc"].includes(options.sortOrder)) {
      throw new BusinessRuleViolationError("无效的排序顺序");
    }
  }

  /**
   * 设置默认选项
   *
   * @description 为查询选项设置默认值
   *
   * @param options - 原始查询选项
   * @returns 带默认值的查询选项
   * @private
   */
  private setDefaultOptions(
    options: TenantQueryOptions,
  ): Required<TenantQueryOptions> {
    return {
      platformId: options.platformId || TenantId.generate(),
      type: options.type || TenantType.ENTERPRISE,
      name: options.name || "",
      includeDeleted: options.includeDeleted || false,
      page: options.page || 1,
      limit: options.limit || 20,
      sortBy: options.sortBy || "createdAt",
      sortOrder: options.sortOrder || "desc",
    };
  }

  /**
   * 映射为租户信息
   *
   * @description 将租户聚合根映射为租户信息
   *
   * @param tenant - 租户聚合根
   * @returns 租户信息
   * @private
   */
  private mapToTenantInfo(tenant: any): TenantInfo {
    return {
      tenantId: tenant.id,
      name: tenant.tenant.name,
      type: tenant.tenant.type,
      platformId: tenant.platformId,
      createdAt: tenant.tenant.createdAt,
      updatedAt: tenant.tenant.updatedAt,
      isDeleted: tenant.tenant.isDeleted,
    };
  }
}
