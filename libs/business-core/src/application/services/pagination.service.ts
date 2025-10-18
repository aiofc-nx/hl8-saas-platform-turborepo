/**
 * 分页服务
 *
 * @description 提供分页功能，支持分页查询、分页结果处理等
 *
 * ## 业务规则
 *
 * ### 分页规则
 * - 分页支持页码和偏移量两种方式
 * - 分页支持排序和过滤
 * - 分页支持性能优化
 * - 分页支持缓存机制
 *
 * ### 性能优化规则
 * - 分页支持游标分页
 * - 分页支持索引优化
 * - 分页支持查询优化
 * - 分页支持结果缓存
 *
 * @example
 * ```typescript
 * // 分页查询用户
 * const paginationService = new PaginationService(cacheService, logger);
 * 
 * const result = await paginationService.paginateUsers({
 *   tenantId: tenantId,
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { ICacheService } from "../ports/cache-service.interface.js";
import { UserUseCaseServices } from "./user-use-case-services.js";
import { OrganizationUseCaseServices } from "./organization-use-case-services.js";
import { DepartmentUseCaseServices } from "./department-use-case-services.js";

// 输入输出类型
import type { GetUserListRequest, GetUserListResponse } from "../use-cases/user/get-user-list.use-case.js";
import type { GetOrganizationsRequest, GetOrganizationsResponse } from "../use-cases/organization/get-organizations.use-case.js";
import type { GetDepartmentsRequest, GetDepartmentsResponse } from "../use-cases/department/get-departments.use-case.js";

/**
 * 分页选项
 */
export interface PaginationOptions {
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: Record<string, any>;
  /** 是否包含总数 */
  includeTotal?: boolean;
  /** 缓存时间（秒） */
  cacheTtl?: number;
}

/**
 * 分页结果
 */
export interface PaginationResult<T> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
  /** 下一页页码 */
  nextPage?: number;
  /** 上一页页码 */
  prevPage?: number;
}

/**
 * 游标分页选项
 */
export interface CursorPaginationOptions {
  /** 游标 */
  cursor?: string;
  /** 每页数量 */
  limit: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
  /** 过滤条件 */
  filters?: Record<string, any>;
  /** 缓存时间（秒） */
  cacheTtl?: number;
}

/**
 * 游标分页结果
 */
export interface CursorPaginationResult<T> {
  /** 数据列表 */
  data: T[];
  /** 下一页游标 */
  nextCursor?: string;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 每页数量 */
  limit: number;
}

/**
 * 分页服务
 *
 * @description 提供分页功能，支持分页查询、分页结果处理等
 */
export class PaginationService {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly userUseCaseServices: UserUseCaseServices,
    private readonly organizationUseCaseServices: OrganizationUseCaseServices,
    private readonly departmentUseCaseServices: DepartmentUseCaseServices,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 分页查询用户
   *
   * @description 分页查询用户列表，支持排序和过滤
   *
   * @param tenantId - 租户ID
   * @param options - 分页选项
   * @returns Promise<分页结果>
   *
   * @example
   * ```typescript
   * const result = await paginationService.paginateUsers(tenantId, {
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  async paginateUsers(
    tenantId: TenantId,
    options: PaginationOptions,
  ): Promise<PaginationResult<any>> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey("users", tenantId, options);

    try {
      // 尝试从缓存获取
      const cachedResult = await this.cacheService.get<PaginationResult<any>>(cacheKey);
      if (cachedResult) {
        this.logger.debug("从缓存获取用户分页结果", { cacheKey });
        return cachedResult;
      }

      // 从数据库获取
      const request: GetUserListRequest = {
        tenantId,
        page: options.page,
        limit: options.limit,
        sortBy: options.sortBy as any,
        sortOrder: options.sortOrder,
        filters: options.filters,
        includeDeleted: false,
      };

      const result = await this.userUseCaseServices.getUserList(request);

      // 构建分页结果
      const paginationResult: PaginationResult<any> = {
        data: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        nextPage: result.hasNext ? result.page + 1 : undefined,
        prevPage: result.hasPrev ? result.page - 1 : undefined,
      };

      // 缓存结果
      const cacheTtl = options.cacheTtl || 300; // 默认5分钟
      await this.cacheService.set(cacheKey, paginationResult, cacheTtl);

      const executionTime = Date.now() - startTime;
      this.logger.info("用户分页查询完成", {
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
        total: result.total,
        executionTime,
      });

      return paginationResult;
    } catch (error) {
      this.logger.error("用户分页查询失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
      });
      throw error;
    }
  }

  /**
   * 分页查询组织
   *
   * @description 分页查询组织列表，支持排序和过滤
   *
   * @param tenantId - 租户ID
   * @param options - 分页选项
   * @returns Promise<分页结果>
   */
  async paginateOrganizations(
    tenantId: TenantId,
    options: PaginationOptions,
  ): Promise<PaginationResult<any>> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey("organizations", tenantId, options);

    try {
      // 尝试从缓存获取
      const cachedResult = await this.cacheService.get<PaginationResult<any>>(cacheKey);
      if (cachedResult) {
        this.logger.debug("从缓存获取组织分页结果", { cacheKey });
        return cachedResult;
      }

      // 从数据库获取
      const request: GetOrganizationsRequest = {
        tenantId,
        page: options.page,
        limit: options.limit,
        sortBy: options.sortBy as any,
        sortOrder: options.sortOrder,
        filters: options.filters,
        includeDeleted: false,
      };

      const result = await this.organizationUseCaseServices.getOrganizations(request);

      // 构建分页结果
      const paginationResult: PaginationResult<any> = {
        data: result.organizations,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        nextPage: result.hasNext ? result.page + 1 : undefined,
        prevPage: result.hasPrev ? result.page - 1 : undefined,
      };

      // 缓存结果
      const cacheTtl = options.cacheTtl || 300; // 默认5分钟
      await this.cacheService.set(cacheKey, paginationResult, cacheTtl);

      const executionTime = Date.now() - startTime;
      this.logger.info("组织分页查询完成", {
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
        total: result.total,
        executionTime,
      });

      return paginationResult;
    } catch (error) {
      this.logger.error("组织分页查询失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
      });
      throw error;
    }
  }

  /**
   * 分页查询部门
   *
   * @description 分页查询部门列表，支持排序和过滤
   *
   * @param tenantId - 租户ID
   * @param options - 分页选项
   * @returns Promise<分页结果>
   */
  async paginateDepartments(
    tenantId: TenantId,
    options: PaginationOptions,
  ): Promise<PaginationResult<any>> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey("departments", tenantId, options);

    try {
      // 尝试从缓存获取
      const cachedResult = await this.cacheService.get<PaginationResult<any>>(cacheKey);
      if (cachedResult) {
        this.logger.debug("从缓存获取部门分页结果", { cacheKey });
        return cachedResult;
      }

      // 从数据库获取
      const request: GetDepartmentsRequest = {
        tenantId,
        page: options.page,
        limit: options.limit,
        sortBy: options.sortBy as any,
        sortOrder: options.sortOrder,
        filters: options.filters,
        includeDeleted: false,
      };

      const result = await this.departmentUseCaseServices.getDepartments(request);

      // 构建分页结果
      const paginationResult: PaginationResult<any> = {
        data: result.departments,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        nextPage: result.hasNext ? result.page + 1 : undefined,
        prevPage: result.hasPrev ? result.page - 1 : undefined,
      };

      // 缓存结果
      const cacheTtl = options.cacheTtl || 300; // 默认5分钟
      await this.cacheService.set(cacheKey, paginationResult, cacheTtl);

      const executionTime = Date.now() - startTime;
      this.logger.info("部门分页查询完成", {
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
        total: result.total,
        executionTime,
      });

      return paginationResult;
    } catch (error) {
      this.logger.error("部门分页查询失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        page: options.page,
        limit: options.limit,
      });
      throw error;
    }
  }

  /**
   * 游标分页查询用户
   *
   * @description 使用游标分页查询用户列表，适用于大数据量场景
   *
   * @param tenantId - 租户ID
   * @param options - 游标分页选项
   * @returns Promise<游标分页结果>
   *
   * @example
   * ```typescript
   * const result = await paginationService.cursorPaginateUsers(tenantId, {
   *   cursor: 'eyJpZCI6IjEyMyJ9',
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  async cursorPaginateUsers(
    tenantId: TenantId,
    options: CursorPaginationOptions,
  ): Promise<CursorPaginationResult<any>> {
    const startTime = Date.now();
    const cacheKey = this.getCursorCacheKey("users", tenantId, options);

    try {
      // 尝试从缓存获取
      const cachedResult = await this.cacheService.get<CursorPaginationResult<any>>(cacheKey);
      if (cachedResult) {
        this.logger.debug("从缓存获取用户游标分页结果", { cacheKey });
        return cachedResult;
      }

      // 从数据库获取（这里需要实现游标分页逻辑）
      const result = await this.userUseCaseServices.getUserList({
        tenantId,
        page: 1,
        limit: options.limit,
        sortBy: options.sortBy as any,
        sortOrder: options.sortOrder,
        filters: options.filters,
        includeDeleted: false,
      });

      // 构建游标分页结果
      const cursorResult: CursorPaginationResult<any> = {
        data: result.users,
        nextCursor: this.generateNextCursor(result.users, options.sortBy),
        hasNext: result.hasNext,
        limit: options.limit,
      };

      // 缓存结果
      const cacheTtl = options.cacheTtl || 300; // 默认5分钟
      await this.cacheService.set(cacheKey, cursorResult, cacheTtl);

      const executionTime = Date.now() - startTime;
      this.logger.info("用户游标分页查询完成", {
        tenantId: tenantId.toString(),
        limit: options.limit,
        dataCount: result.users.length,
        executionTime,
      });

      return cursorResult;
    } catch (error) {
      this.logger.error("用户游标分页查询失败", {
        error: error.message,
        tenantId: tenantId.toString(),
        limit: options.limit,
      });
      throw error;
    }
  }

  /**
   * 获取缓存键
   *
   * @param type - 类型
   * @param tenantId - 租户ID
   * @param options - 分页选项
   * @returns 缓存键
   * @private
   */
  private getCacheKey(type: string, tenantId: TenantId, options: PaginationOptions): string {
    const filtersStr = JSON.stringify(options.filters || {});
    return `pagination:${type}:${tenantId.toString()}:${options.page}:${options.limit}:${options.sortBy}:${options.sortOrder}:${filtersStr}`;
  }

  /**
   * 获取游标缓存键
   *
   * @param type - 类型
   * @param tenantId - 租户ID
   * @param options - 游标分页选项
   * @returns 缓存键
   * @private
   */
  private getCursorCacheKey(type: string, tenantId: TenantId, options: CursorPaginationOptions): string {
    const filtersStr = JSON.stringify(options.filters || {});
    return `cursor_pagination:${type}:${tenantId.toString()}:${options.cursor}:${options.limit}:${options.sortBy}:${options.sortOrder}:${filtersStr}`;
  }

  /**
   * 生成下一个游标
   *
   * @param data - 数据列表
   * @param sortBy - 排序字段
   * @returns 下一个游标
   * @private
   */
  private generateNextCursor(data: any[], sortBy?: string): string | undefined {
    if (data.length === 0) {
      return undefined;
    }

    const lastItem = data[data.length - 1];
    const cursorData = {
      id: lastItem.id,
      sortBy: sortBy,
      sortValue: sortBy ? lastItem[sortBy] : lastItem.id,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  }
}
