/**
 * 获取组织列表用例
 *
 * @description 获取组织列表，支持分页、过滤和排序
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有租户管理员可以查看组织列表
 * - 查询组织列表需要验证权限
 * - 查询组织列表需要支持缓存
 * - 查询组织列表需要支持分页
 *
 * ### 验证规则
 * - 查询者必须有权限
 * - 查询参数必须有效
 * - 分页参数必须合理
 *
 * @example
 * ```typescript
 * const getOrganizationsUseCase = new GetOrganizationsUseCase(organizationRepository, cacheService, logger);
 * 
 * const result = await getOrganizationsUseCase.execute({
 *   tenantId: tenantId,
 *   page: 1,
 *   limit: 20,
 *   filters: { type: 'COMMITTEE' }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseQueryUseCase } from "../base/base-query-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 组织查询选项
 */
export interface OrganizationQueryOptions {
  /** 租户ID */
  tenantId: TenantId;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sortBy?: "name" | "type" | "createdAt" | "updatedAt";
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: {
    type?: string;
    status?: string;
    name?: string;
  };
  /** 是否包含已删除的组织 */
  includeDeleted?: boolean;
}

/**
 * 获取组织列表请求
 */
export interface GetOrganizationsRequest extends OrganizationQueryOptions {}

/**
 * 获取组织列表响应
 */
export interface GetOrganizationsResponse {
  /** 组织列表 */
  organizations: Array<{
    /** 组织ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 组织名称 */
    name: string;
    /** 组织类型 */
    type: string;
    /** 组织描述 */
    description?: string;
    /** 组织状态 */
    status: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
  }>;
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * 获取组织列表用例接口
 */
export interface IGetOrganizationsUseCase {
  execute(request: GetOrganizationsRequest): Promise<GetOrganizationsResponse>;
}

/**
 * 获取组织列表用例
 *
 * @description 获取组织列表，支持分页、过滤和排序
 */
export class GetOrganizationsUseCase extends BaseQueryUseCase<
  GetOrganizationsRequest,
  GetOrganizationsResponse
> implements IGetOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetOrganizations", "获取组织列表用例", "1.0.0", ["organization:read"], cacheService, logger);
  }

  /**
   * 执行获取组织列表查询
   *
   * @param request - 获取组织列表请求
   * @returns Promise<获取组织列表响应>
   */
  protected async executeQuery(
    request: GetOrganizationsRequest,
    context: IUseCaseContext,
  ): Promise<GetOrganizationsResponse> {
    this.validateRequest(request);
    await this.validateQueryPermissions(request, context);
    
    // 设置默认查询选项
    const queryOptions = this.setDefaultOptions(request);
    
    // 尝试从缓存获取
    const cacheKey = this.getCacheKey(queryOptions);
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 从数据库获取
    const { organizations, total } = await this.organizationRepository.findMany(queryOptions);
    
    // 映射组织信息
    const organizationInfos = organizations.map(organizationAggregate => {
      const organization = organizationAggregate.getOrganization();
      return {
        id: organizationAggregate.id,
        tenantId: organizationAggregate.tenantId,
        name: organization.name,
        type: organization.type,
        description: organization.description,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };
    });

    const result: GetOrganizationsResponse = {
      organizations: organizationInfos,
      total,
      page: queryOptions.page,
      limit: queryOptions.limit,
      hasNext: queryOptions.page * queryOptions.limit < total,
      hasPrev: queryOptions.page > 1,
    };

    // 缓存结果
    await this.cacheResult(cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  /**
   * 验证请求参数
   *
   * @param request - 获取组织列表请求
   * @private
   */
  private validateRequest(request: GetOrganizationsRequest): void {
    if (!request.tenantId) {
      throw new ValidationException(
        "TENANT_ID_REQUIRED",
        "租户ID不能为空",
        "租户ID是必填字段",
        400
      );
    }
    if (request.page && request.page < 1) {
      throw new ValidationException(
        "INVALID_PAGE",
        "页码必须大于0",
        "页码必须大于0",
        400
      );
    }
    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new ValidationException(
        "INVALID_LIMIT",
        "每页数量必须在1-100之间",
        "每页数量必须在1-100之间",
        400
      );
    }
  }

  /**
   * 验证查询权限
   *
   * @param request - 获取组织列表请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetOrganizationsRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为租户管理员
    const isTenantAdmin = context.user?.role === "TENANT_ADMIN";
    
    if (!isTenantAdmin) {
      throw new UnauthorizedOperationException(
        "查看组织列表",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 设置默认查询选项
   *
   * @param request - 获取组织列表请求
   * @returns 查询选项
   * @private
   */
  private setDefaultOptions(request: GetOrganizationsRequest): OrganizationQueryOptions {
    return {
      tenantId: request.tenantId,
      page: request.page || 1,
      limit: request.limit || 20,
      sortBy: request.sortBy || "createdAt",
      sortOrder: request.sortOrder || "desc",
      filters: request.filters || {},
      includeDeleted: request.includeDeleted || false,
    };
  }

  /**
   * 获取缓存键
   *
   * @param queryOptions - 查询选项
   * @returns 缓存键
   * @private
   */
  private getCacheKey(queryOptions: OrganizationQueryOptions): string {
    const filtersStr = JSON.stringify(queryOptions.filters || {});
    return `organization_list:${queryOptions.tenantId.toString()}:${queryOptions.page}:${queryOptions.limit}:${queryOptions.sortBy}:${queryOptions.sortOrder}:${filtersStr}`;
  }
}
