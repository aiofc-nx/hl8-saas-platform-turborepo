/**
 * 租户CQRS查询
 *
 * @description 定义租户相关的查询，包括获取、搜索、统计等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";

/**
 * 获取租户查询
 *
 * @description 根据ID获取租户的查询
 */
export class GetTenantQuery extends BaseQuery {
  /** 租户ID */
  tenantId: EntityId;

  constructor(tenantId: EntityId) {
    super("GetTenant", "获取租户查询");
    this.tenantId = tenantId;
  }
}

/**
 * 获取租户列表查询
 *
 * @description 获取租户列表的查询
 */
export class GetTenantsQuery extends BaseQuery {
  /** 平台ID */
  platformId?: EntityId;
  
  /** 租户类型 */
  type?: TenantType;
  
  /** 是否包含已删除的租户 */
  includeDeleted?: boolean;
  
  /** 页码 */
  page?: number;
  
  /** 每页记录数 */
  limit?: number;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";

  constructor(
    platformId?: EntityId,
    type?: TenantType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetTenants", "获取租户列表查询");
    this.platformId = platformId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据平台获取租户查询
 *
 * @description 根据平台ID获取租户列表的查询
 */
export class GetTenantsByPlatformQuery extends BaseQuery {
  /** 平台ID */
  platformId: EntityId;
  
  /** 租户类型 */
  type?: TenantType;
  
  /** 是否包含已删除的租户 */
  includeDeleted?: boolean;
  
  /** 页码 */
  page?: number;
  
  /** 每页记录数 */
  limit?: number;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";

  constructor(
    platformId: EntityId,
    type?: TenantType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetTenantsByPlatform", "根据平台获取租户查询");
    this.platformId = platformId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 搜索租户查询
 *
 * @description 根据关键词搜索租户的查询
 */
export class SearchTenantsQuery extends BaseQuery {
  /** 搜索关键词 */
  keyword: string;
  
  /** 平台ID */
  platformId?: EntityId;
  
  /** 租户类型 */
  type?: TenantType;
  
  /** 是否包含已删除的租户 */
  includeDeleted?: boolean;
  
  /** 页码 */
  page?: number;
  
  /** 每页记录数 */
  limit?: number;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";

  constructor(
    keyword: string,
    platformId?: EntityId,
    type?: TenantType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("SearchTenants", "搜索租户查询");
    this.keyword = keyword;
    this.platformId = platformId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 统计租户查询
 *
 * @description 统计租户数量的查询
 */
export class CountTenantsQuery extends BaseQuery {
  /** 平台ID */
  platformId?: EntityId;
  
  /** 租户类型 */
  type?: TenantType;
  
  /** 是否包含已删除的租户 */
  includeDeleted?: boolean;

  constructor(
    platformId?: EntityId,
    type?: TenantType,
    includeDeleted?: boolean,
  ) {
    super("CountTenants", "统计租户查询");
    this.platformId = platformId;
    this.type = type;
    this.includeDeleted = includeDeleted;
  }
}
