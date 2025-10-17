/**
 * 租户查询处理器
 *
 * @description 处理租户相关的查询，包括获取、搜索、统计等操作
 *
 * @since 1.0.0
 */

import { QueryHandler } from "../../decorators/query-handler.decorator.js";
import { BaseQueryHandler } from "../../base/base-query-handler.js";
import { GetTenantQuery } from "../../queries/tenant-queries.js";
import { GetTenantsQuery } from "../../queries/tenant-queries.js";
import { GetTenantsByPlatformQuery } from "../../queries/tenant-queries.js";
import { SearchTenantsQuery } from "../../queries/tenant-queries.js";
import { CountTenantsQuery } from "../../queries/tenant-queries.js";
import { GetTenantUseCase } from "../../../use-cases/tenant/get-tenant.use-case.js";
import { GetTenantsUseCase } from "../../../use-cases/tenant/get-tenants.use-case.js";
import { SearchTenantsUseCase } from "../../../use-cases/tenant/search-tenants.use-case.js";
import { CountTenantsUseCase } from "../../../use-cases/tenant/count-tenants.use-case.js";
import type { IUseCaseContext } from "../../../use-cases/base/use-case.interface.js";

/**
 * 获取租户查询处理器
 *
 * @description 处理获取租户的查询
 */
@QueryHandler(GetTenantQuery)
export class GetTenantQueryHandler extends BaseQueryHandler<GetTenantQuery> {
  constructor(
    private readonly getTenantUseCase: GetTenantUseCase,
  ) {
    super();
  }

  /**
   * 处理获取租户查询
   *
   * @param query - 获取租户查询
   * @param context - 执行上下文
   * @returns Promise<租户信息>
   */
  async handle(query: GetTenantQuery, context: IUseCaseContext): Promise<any> {
    const request = {
      tenantId: query.tenantId,
    };

    return await this.getTenantUseCase.execute(request, context);
  }
}

/**
 * 获取租户列表查询处理器
 *
 * @description 处理获取租户列表的查询
 */
@QueryHandler(GetTenantsQuery)
export class GetTenantsQueryHandler extends BaseQueryHandler<GetTenantsQuery> {
  constructor(
    private readonly getTenantsUseCase: GetTenantsUseCase,
  ) {
    super();
  }

  /**
   * 处理获取租户列表查询
   *
   * @param query - 获取租户列表查询
   * @param context - 执行上下文
   * @returns Promise<租户列表>
   */
  async handle(query: GetTenantsQuery, context: IUseCaseContext): Promise<any> {
    const request = {
      platformId: query.platformId,
      type: query.type,
      includeDeleted: query.includeDeleted,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return await this.getTenantsUseCase.execute(request, context);
  }
}

/**
 * 根据平台获取租户查询处理器
 *
 * @description 处理根据平台获取租户的查询
 */
@QueryHandler(GetTenantsByPlatformQuery)
export class GetTenantsByPlatformQueryHandler extends BaseQueryHandler<GetTenantsByPlatformQuery> {
  constructor(
    private readonly getTenantsUseCase: GetTenantsUseCase,
  ) {
    super();
  }

  /**
   * 处理根据平台获取租户查询
   *
   * @param query - 根据平台获取租户查询
   * @param context - 执行上下文
   * @returns Promise<租户列表>
   */
  async handle(query: GetTenantsByPlatformQuery, context: IUseCaseContext): Promise<any> {
    const request = {
      platformId: query.platformId,
      type: query.type,
      includeDeleted: query.includeDeleted,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return await this.getTenantsUseCase.execute(request, context);
  }
}

/**
 * 搜索租户查询处理器
 *
 * @description 处理搜索租户的查询
 */
@QueryHandler(SearchTenantsQuery)
export class SearchTenantsQueryHandler extends BaseQueryHandler<SearchTenantsQuery> {
  constructor(
    private readonly searchTenantsUseCase: SearchTenantsUseCase,
  ) {
    super();
  }

  /**
   * 处理搜索租户查询
   *
   * @param query - 搜索租户查询
   * @param context - 执行上下文
   * @returns Promise<租户列表>
   */
  async handle(query: SearchTenantsQuery, context: IUseCaseContext): Promise<any> {
    const request = {
      keyword: query.keyword,
      platformId: query.platformId,
      type: query.type,
      includeDeleted: query.includeDeleted,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return await this.searchTenantsUseCase.execute(request, context);
  }
}

/**
 * 统计租户查询处理器
 *
 * @description 处理统计租户的查询
 */
@QueryHandler(CountTenantsQuery)
export class CountTenantsQueryHandler extends BaseQueryHandler<CountTenantsQuery> {
  constructor(
    private readonly countTenantsUseCase: CountTenantsUseCase,
  ) {
    super();
  }

  /**
   * 处理统计租户查询
   *
   * @param query - 统计租户查询
   * @param context - 执行上下文
   * @returns Promise<租户数量>
   */
  async handle(query: CountTenantsQuery, context: IUseCaseContext): Promise<any> {
    const request = {
      platformId: query.platformId,
      type: query.type,
      includeDeleted: query.includeDeleted,
    };

    return await this.countTenantsUseCase.execute(request, context);
  }
}
