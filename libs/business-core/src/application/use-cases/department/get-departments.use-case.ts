/**
 * 获取部门列表用例
 *
 * @description 获取部门列表，支持分页、过滤和排序
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有租户管理员可以查看部门列表
 * - 查询部门列表需要验证权限
 * - 查询部门列表需要支持缓存
 * - 查询部门列表需要支持分页
 *
 * ### 验证规则
 * - 查询者必须有权限
 * - 查询参数必须有效
 * - 分页参数必须合理
 *
 * @example
 * ```typescript
 * const getDepartmentsUseCase = new GetDepartmentsUseCase(departmentRepository, cacheService, logger);
 * 
 * const result = await getDepartmentsUseCase.execute({
 *   tenantId: tenantId,
 *   page: 1,
 *   limit: 20,
 *   filters: { level: 1 }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseQueryUseCase } from "../base/base-query-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";

/**
 * 部门查询选项
 */
export interface DepartmentQueryOptions {
  /** 租户ID */
  tenantId: TenantId;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sortBy?: "name" | "level" | "createdAt" | "updatedAt";
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: {
    level?: number;
    status?: string;
    name?: string;
    parentDepartmentId?: EntityId;
  };
  /** 是否包含已删除的部门 */
  includeDeleted?: boolean;
}

/**
 * 获取部门列表请求
 */
export interface GetDepartmentsRequest extends DepartmentQueryOptions {}

/**
 * 获取部门列表响应
 */
export interface GetDepartmentsResponse {
  /** 部门列表 */
  departments: Array<{
    /** 部门ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 部门名称 */
    name: string;
    /** 部门层级 */
    level: number;
    /** 父部门ID */
    parentDepartmentId?: EntityId;
    /** 部门描述 */
    description?: string;
    /** 部门状态 */
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
 * 获取部门列表用例接口
 */
export interface IGetDepartmentsUseCase {
  execute(request: GetDepartmentsRequest): Promise<GetDepartmentsResponse>;
}

/**
 * 获取部门列表用例
 *
 * @description 获取部门列表，支持分页、过滤和排序
 */
export class GetDepartmentsUseCase extends BaseQueryUseCase<
  GetDepartmentsRequest,
  GetDepartmentsResponse
> implements IGetDepartmentsUseCase {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetDepartments", "获取部门列表用例", "1.0.0", ["department:read"], cacheService, logger);
  }

  /**
   * 执行获取部门列表查询
   *
   * @param request - 获取部门列表请求
   * @returns Promise<获取部门列表响应>
   */
  protected async executeQuery(
    request: GetDepartmentsRequest,
    context: IUseCaseContext,
  ): Promise<GetDepartmentsResponse> {
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
    const { departments, total } = await this.departmentRepository.findMany(queryOptions);
    
    // 映射部门信息
    const departmentInfos = departments.map(departmentAggregate => {
      const department = departmentAggregate.getDepartment();
      return {
        id: departmentAggregate.id,
        tenantId: departmentAggregate.tenantId,
        name: department.name,
        level: department.level.value,
        parentDepartmentId: department.parentDepartmentId,
        description: department.description,
        status: department.status,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      };
    });

    const result: GetDepartmentsResponse = {
      departments: departmentInfos,
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
   * @param request - 获取部门列表请求
   * @private
   */
  private validateRequest(request: GetDepartmentsRequest): void {
    if (!request.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (request.page && request.page < 1) {
      throw new Error("页码必须大于0");
    }
    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new Error("每页数量必须在1-100之间");
    }
  }

  /**
   * 验证查询权限
   *
   * @param request - 获取部门列表请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetDepartmentsRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为租户管理员
    const isTenantAdmin = context.user?.role === "TENANT_ADMIN";
    
    if (!isTenantAdmin) {
      throw new Error("只有租户管理员可以查看部门列表");
    }
  }

  /**
   * 设置默认查询选项
   *
   * @param request - 获取部门列表请求
   * @returns 查询选项
   * @private
   */
  private setDefaultOptions(request: GetDepartmentsRequest): DepartmentQueryOptions {
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
  private getCacheKey(queryOptions: DepartmentQueryOptions): string {
    const filtersStr = JSON.stringify(queryOptions.filters || {});
    return `department_list:${queryOptions.tenantId.toString()}:${queryOptions.page}:${queryOptions.limit}:${queryOptions.sortBy}:${queryOptions.sortOrder}:${filtersStr}`;
  }
}
