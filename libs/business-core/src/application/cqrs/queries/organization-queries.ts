/**
 * 组织CQRS查询
 *
 * @description 定义组织相关的查询，包括获取、搜索、统计等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, OrganizationId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";

/**
 * 获取组织查询
 *
 * @description 根据ID获取组织的查询
 */
export class GetOrganizationQuery extends BaseQuery {
  /** 组织ID */
  organizationId: OrganizationId;

  constructor(organizationId: OrganizationId) {
    super("GetOrganization", "获取组织查询");
    this.organizationId = organizationId;
  }
}

/**
 * 获取组织列表查询
 *
 * @description 获取组织列表的查询
 */
export class GetOrganizationsQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;

  /** 组织类型 */
  type?: OrganizationType;

  /** 父组织ID */
  parentOrganizationId?: OrganizationId;

  /** 是否包含已删除的组织 */
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
    tenantId: TenantId,
    type?: OrganizationType,
    parentOrganizationId?: OrganizationId,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetOrganizations", "获取组织列表查询");
    this.tenantId = tenantId;
    this.type = type;
    this.parentOrganizationId = parentOrganizationId;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据租户获取组织查询
 *
 * @description 根据租户ID获取组织列表的查询
 */
export class GetOrganizationsByTenantQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;

  /** 组织类型 */
  type?: OrganizationType;

  /** 是否包含已删除的组织 */
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
    tenantId: TenantId,
    type?: OrganizationType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetOrganizationsByTenant", "根据租户获取组织查询");
    this.tenantId = tenantId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据父组织获取子组织查询
 *
 * @description 根据父组织ID获取子组织列表的查询
 */
export class GetChildOrganizationsQuery extends BaseQuery {
  /** 父组织ID */
  parentOrganizationId: OrganizationId;

  /** 组织类型 */
  type?: OrganizationType;

  /** 是否包含已删除的组织 */
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
    parentOrganizationId: OrganizationId,
    type?: OrganizationType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetChildOrganizations", "根据父组织获取子组织查询");
    this.parentOrganizationId = parentOrganizationId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 搜索组织查询
 *
 * @description 根据关键词搜索组织的查询
 */
export class SearchOrganizationsQuery extends BaseQuery {
  /** 搜索关键词 */
  keyword: string;

  /** 租户ID */
  tenantId: TenantId;

  /** 组织类型 */
  type?: OrganizationType;

  /** 是否包含已删除的组织 */
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
    tenantId: TenantId,
    type?: OrganizationType,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("SearchOrganizations", "搜索组织查询");
    this.keyword = keyword;
    this.tenantId = tenantId;
    this.type = type;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 统计组织查询
 *
 * @description 统计组织数量的查询
 */
export class CountOrganizationsQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;

  /** 组织类型 */
  type?: OrganizationType;

  /** 父组织ID */
  parentOrganizationId?: OrganizationId;

  /** 是否包含已删除的组织 */
  includeDeleted?: boolean;

  constructor(
    tenantId: TenantId,
    type?: OrganizationType,
    parentOrganizationId?: OrganizationId,
    includeDeleted?: boolean,
  ) {
    super("CountOrganizations", "统计组织查询");
    this.tenantId = tenantId;
    this.type = type;
    this.parentOrganizationId = parentOrganizationId;
    this.includeDeleted = includeDeleted;
  }
}
