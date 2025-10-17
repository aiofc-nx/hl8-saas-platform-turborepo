/**
 * 部门CQRS查询
 *
 * @description 定义部门相关的查询，包括获取、搜索、统计等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, OrganizationId, DepartmentId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";

/**
 * 获取部门查询
 *
 * @description 根据ID获取部门的查询
 */
export class GetDepartmentQuery extends BaseQuery {
  /** 部门ID */
  departmentId: DepartmentId;

  constructor(departmentId: DepartmentId) {
    super("GetDepartment", "获取部门查询");
    this.departmentId = departmentId;
  }
}

/**
 * 获取部门列表查询
 *
 * @description 获取部门列表的查询
 */
export class GetDepartmentsQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 父部门ID */
  parentDepartmentId?: DepartmentId;
  
  /** 是否包含已删除的部门 */
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
    organizationId?: OrganizationId,
    level?: DepartmentLevel,
    parentDepartmentId?: DepartmentId,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetDepartments", "获取部门列表查询");
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.level = level;
    this.parentDepartmentId = parentDepartmentId;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据组织获取部门查询
 *
 * @description 根据组织ID获取部门列表的查询
 */
export class GetDepartmentsByOrganizationQuery extends BaseQuery {
  /** 组织ID */
  organizationId: OrganizationId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 父部门ID */
  parentDepartmentId?: DepartmentId;
  
  /** 是否包含已删除的部门 */
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
    organizationId: OrganizationId,
    level?: DepartmentLevel,
    parentDepartmentId?: DepartmentId,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetDepartmentsByOrganization", "根据组织获取部门查询");
    this.organizationId = organizationId;
    this.level = level;
    this.parentDepartmentId = parentDepartmentId;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据父部门获取子部门查询
 *
 * @description 根据父部门ID获取子部门列表的查询
 */
export class GetChildDepartmentsQuery extends BaseQuery {
  /** 父部门ID */
  parentDepartmentId: DepartmentId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 是否包含已删除的部门 */
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
    parentDepartmentId: DepartmentId,
    level?: DepartmentLevel,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetChildDepartments", "根据父部门获取子部门查询");
    this.parentDepartmentId = parentDepartmentId;
    this.level = level;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 搜索部门查询
 *
 * @description 根据关键词搜索部门的查询
 */
export class SearchDepartmentsQuery extends BaseQuery {
  /** 搜索关键词 */
  keyword: string;
  
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 是否包含已删除的部门 */
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
    organizationId?: OrganizationId,
    level?: DepartmentLevel,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("SearchDepartments", "搜索部门查询");
    this.keyword = keyword;
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.level = level;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 统计部门查询
 *
 * @description 统计部门数量的查询
 */
export class CountDepartmentsQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 父部门ID */
  parentDepartmentId?: DepartmentId;
  
  /** 是否包含已删除的部门 */
  includeDeleted?: boolean;

  constructor(
    tenantId: TenantId,
    organizationId?: OrganizationId,
    level?: DepartmentLevel,
    parentDepartmentId?: DepartmentId,
    includeDeleted?: boolean,
  ) {
    super("CountDepartments", "统计部门查询");
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.level = level;
    this.parentDepartmentId = parentDepartmentId;
    this.includeDeleted = includeDeleted;
  }
}
