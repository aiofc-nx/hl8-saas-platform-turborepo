/**
 * 租户列表查询
 *
 * @description 查询租户列表的查询对象
 *
 * @class ListTenantsQuery
 * @since 1.0.0
 */

import { IQuery } from "@hl8/hybrid-archi";
import { TenantType } from "../../../../domain/tenant/value-objects/tenant-type.enum.js";

export interface ListTenantsQueryParams {
  /** 租户ID（用于过滤） */
  tenantId?: string;
  /** 用户ID（用于权限检查） */
  userId?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortBy?: "createdAt" | "updatedAt" | "name" | "code";
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
  /** 租户类型过滤 */
  type?: TenantType;
  /** 关键词搜索 */
  keyword?: string;
}

export class ListTenantsQuery implements IQuery {
  public readonly tenantId?: string;
  public readonly userId?: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortBy: string;
  public readonly sortOrder: "asc" | "desc";
  public readonly type?: TenantType;
  public readonly keyword?: string;

  constructor(params: ListTenantsQueryParams = {}) {
    this.tenantId = params.tenantId;
    this.userId = params.userId;
    this.page = params.page ?? 1;
    this.pageSize = params.pageSize ?? 20;
    this.sortBy = params.sortBy ?? "createdAt";
    this.sortOrder = params.sortOrder ?? "desc";
    this.type = params.type;
    this.keyword = params.keyword;
  }
}
