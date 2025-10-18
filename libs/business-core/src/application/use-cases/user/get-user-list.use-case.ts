/**
 * 获取用户列表用例
 *
 * @description 获取用户列表，支持分页、过滤和排序
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有管理员可以查看用户列表
 * - 查询用户列表需要验证权限
 * - 查询用户列表需要支持缓存
 * - 查询用户列表需要支持分页
 *
 * ### 验证规则
 * - 查询者必须有权限
 * - 查询参数必须有效
 * - 分页参数必须合理
 *
 * @example
 * ```typescript
 * const getUserListUseCase = new GetUserListUseCase(userRepository, cacheService, logger);
 * 
 * const result = await getUserListUseCase.execute({
 *   tenantId: tenantId,
 *   page: 1,
 *   limit: 20,
 *   filters: { status: 'ACTIVE' }
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseQueryUseCase } from "../base/base-query-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";

/**
 * 用户查询选项
 */
export interface UserQueryOptions {
  /** 租户ID */
  tenantId: TenantId;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 排序字段 */
  sortBy?: "username" | "displayName" | "email" | "createdAt" | "updatedAt";
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: {
    status?: string;
    role?: string;
    username?: string;
    email?: string;
  };
  /** 是否包含已删除的用户 */
  includeDeleted?: boolean;
}

/**
 * 获取用户列表请求
 */
export interface GetUserListRequest extends UserQueryOptions {}

/**
 * 获取用户列表响应
 */
export interface GetUserListResponse {
  /** 用户列表 */
  users: Array<{
    /** 用户ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 用户名 */
    username: string;
    /** 显示名称 */
    displayName: string;
    /** 邮箱 */
    email: string;
    /** 角色 */
    role: string;
    /** 状态 */
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
 * 获取用户列表用例接口
 */
export interface IGetUserListUseCase {
  execute(request: GetUserListRequest): Promise<GetUserListResponse>;
}

/**
 * 获取用户列表用例
 *
 * @description 获取用户列表，支持分页、过滤和排序
 */
export class GetUserListUseCase extends BaseQueryUseCase<
  GetUserListRequest,
  GetUserListResponse
> implements IGetUserListUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetUserList", "获取用户列表用例", "1.0.0", ["user:read"], cacheService, logger);
  }

  /**
   * 执行获取用户列表查询
   *
   * @param request - 获取用户列表请求
   * @returns Promise<获取用户列表响应>
   */
  protected async executeQuery(
    request: GetUserListRequest,
    context: IUseCaseContext,
  ): Promise<GetUserListResponse> {
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
    const { users, total } = await this.userRepository.findMany(queryOptions);
    
    // 映射用户信息
    const userInfos = users.map(userAggregate => {
      const user = userAggregate.getUser();
      return {
        id: userAggregate.id,
        tenantId: userAggregate.tenantId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    const result: GetUserListResponse = {
      users: userInfos,
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
   * @param request - 获取用户列表请求
   * @private
   */
  private validateRequest(request: GetUserListRequest): void {
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
   * @param request - 获取用户列表请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetUserListRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为管理员
    const isAdmin = context.user?.role === "ADMIN";
    
    if (!isAdmin) {
      throw new Error("只有管理员可以查看用户列表");
    }
  }

  /**
   * 设置默认查询选项
   *
   * @param request - 获取用户列表请求
   * @returns 查询选项
   * @private
   */
  private setDefaultOptions(request: GetUserListRequest): UserQueryOptions {
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
  private getCacheKey(queryOptions: UserQueryOptions): string {
    const filtersStr = JSON.stringify(queryOptions.filters || {});
    return `user_list:${queryOptions.tenantId.toString()}:${queryOptions.page}:${queryOptions.limit}:${queryOptions.sortBy}:${queryOptions.sortOrder}:${filtersStr}`;
  }
}
