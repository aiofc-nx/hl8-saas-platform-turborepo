/**
 * 用户CQRS查询
 *
 * @description 定义用户相关的查询，包括获取、搜索、统计等操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, UserId, OrganizationId, DepartmentId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import { UserRole } from "../../../domain/value-objects/types/user-role.vo.js";

/**
 * 获取用户查询
 *
 * @description 根据ID获取用户的查询
 */
export class GetUserQuery extends BaseQuery {
  /** 用户ID */
  userId: UserId;

  constructor(userId: UserId) {
    super("GetUser", "获取用户查询");
    this.userId = userId;
  }
}

/**
 * 获取用户列表查询
 *
 * @description 获取用户列表的查询
 */
export class GetUsersQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门ID */
  departmentId?: DepartmentId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 用户角色 */
  role?: UserRole;
  
  /** 是否包含已删除的用户 */
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
    departmentId?: DepartmentId,
    status?: UserStatus,
    role?: UserRole,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetUsers", "获取用户列表查询");
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.departmentId = departmentId;
    this.status = status;
    this.role = role;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据组织获取用户查询
 *
 * @description 根据组织ID获取用户列表的查询
 */
export class GetUsersByOrganizationQuery extends BaseQuery {
  /** 组织ID */
  organizationId: OrganizationId;
  
  /** 部门ID */
  departmentId?: DepartmentId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 用户角色 */
  role?: UserRole;
  
  /** 是否包含已删除的用户 */
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
    departmentId?: DepartmentId,
    status?: UserStatus,
    role?: UserRole,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetUsersByOrganization", "根据组织获取用户查询");
    this.organizationId = organizationId;
    this.departmentId = departmentId;
    this.status = status;
    this.role = role;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据部门获取用户查询
 *
 * @description 根据部门ID获取用户列表的查询
 */
export class GetUsersByDepartmentQuery extends BaseQuery {
  /** 部门ID */
  departmentId: DepartmentId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 用户角色 */
  role?: UserRole;
  
  /** 是否包含已删除的用户 */
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
    departmentId: DepartmentId,
    status?: UserStatus,
    role?: UserRole,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetUsersByDepartment", "根据部门获取用户查询");
    this.departmentId = departmentId;
    this.status = status;
    this.role = role;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 根据角色获取用户查询
 *
 * @description 根据角色ID获取用户列表的查询
 */
export class GetUsersByRoleQuery extends BaseQuery {
  /** 角色ID */
  roleId: EntityId;
  
  /** 租户ID */
  tenantId: TenantId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 是否包含已删除的用户 */
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
    roleId: EntityId,
    tenantId: TenantId,
    status?: UserStatus,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("GetUsersByRole", "根据角色获取用户查询");
    this.roleId = roleId;
    this.tenantId = tenantId;
    this.status = status;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 搜索用户查询
 *
 * @description 根据关键词搜索用户的查询
 */
export class SearchUsersQuery extends BaseQuery {
  /** 搜索关键词 */
  keyword: string;
  
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门ID */
  departmentId?: DepartmentId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 用户角色 */
  role?: UserRole;
  
  /** 是否包含已删除的用户 */
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
    departmentId?: DepartmentId,
    status?: UserStatus,
    role?: UserRole,
    includeDeleted?: boolean,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) {
    super("SearchUsers", "搜索用户查询");
    this.keyword = keyword;
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.departmentId = departmentId;
    this.status = status;
    this.role = role;
    this.includeDeleted = includeDeleted;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}

/**
 * 统计用户查询
 *
 * @description 统计用户数量的查询
 */
export class CountUsersQuery extends BaseQuery {
  /** 租户ID */
  tenantId: TenantId;
  
  /** 组织ID */
  organizationId?: OrganizationId;
  
  /** 部门ID */
  departmentId?: DepartmentId;
  
  /** 用户状态 */
  status?: UserStatus;
  
  /** 用户角色 */
  role?: UserRole;
  
  /** 是否包含已删除的用户 */
  includeDeleted?: boolean;

  constructor(
    tenantId: TenantId,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    status?: UserStatus,
    role?: UserRole,
    includeDeleted?: boolean,
  ) {
    super("CountUsers", "统计用户查询");
    this.tenantId = tenantId;
    this.organizationId = organizationId;
    this.departmentId = departmentId;
    this.status = status;
    this.role = role;
    this.includeDeleted = includeDeleted;
  }
}
