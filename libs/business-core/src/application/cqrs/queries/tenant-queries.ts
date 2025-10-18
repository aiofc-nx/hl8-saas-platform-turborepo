/**
 * 租户CQRS查询
 *
 * @description 定义租户相关的查询，包括获取租户信息、租户列表等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";

/**
 * 获取租户查询
 *
 * @description 获取单个租户信息的查询
 */
export class GetTenantQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;

  constructor(tenantId: TenantId) {
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

  /** 租户名称 */
  name?: string;

  /** 是否包含已删除的租户 */
  includeDeleted?: boolean;

  /** 页码 */
  page?: number;

  /** 每页数量 */
  limit?: number;

  /** 排序字段 */
  sortBy?: "name" | "type" | "createdAt" | "updatedAt";

  /** 排序顺序 */
  sortOrder?: "asc" | "desc";

  /** 过滤条件 */
  filters?: Record<string, any>;

  constructor(
    platformId?: EntityId,
    type?: TenantType,
    name?: string,
    includeDeleted = false,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters?: Record<string, any>,
  ) {
    super("GetTenants", "获取租户列表查询");
    this.platformId = platformId;
    this.type = type;
    this.name = name;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.filters = filters;
  }
}
