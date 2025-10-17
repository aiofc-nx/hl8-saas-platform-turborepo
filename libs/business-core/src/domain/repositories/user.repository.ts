/**
 * 用户仓储接口
 *
 * @description 定义用户数据访问的抽象接口，支持CRUD操作和复杂查询
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { UserAggregate } from "../aggregates/user-aggregate.js";
import { UserStatus } from "../value-objects/types/user-status.vo.js";
import { UserRole } from "../value-objects/types/user-role.vo.js";
import { IPaginatedResult } from "./base/repository.interface.js";

/**
 * 用户查询选项接口
 */
export interface UserQueryOptions {
  /** 租户ID */
  tenantId?: TenantId;

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
}

/**
 * 用户仓储接口
 *
 * @description 定义用户数据访问的抽象接口，支持CRUD操作和复杂查询
 */
export interface IUserRepository {
  /**
   * 保存用户聚合根
   *
   * @param user - 用户聚合根
   * @returns Promise<void>
   */
  save(user: UserAggregate): Promise<void>;

  /**
   * 根据ID查找用户
   *
   * @param id - 用户ID
   * @returns Promise<用户聚合根 | null>
   */
  findById(id: EntityId): Promise<UserAggregate | null>;

  /**
   * 根据用户名查找用户
   *
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @returns Promise<用户聚合根 | null>
   */
  findByUsername(
    tenantId: TenantId,
    username: string,
  ): Promise<UserAggregate | null>;

  /**
   * 根据邮箱查找用户
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱地址
   * @returns Promise<用户聚合根 | null>
   */
  findByEmail(tenantId: TenantId, email: string): Promise<UserAggregate | null>;

  /**
   * 根据租户ID查找用户列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByTenantId(
    tenantId: TenantId,
    options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserAggregate>>;

  /**
   * 根据组织ID查找用户列表
   *
   * @param organizationId - 组织ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByOrganizationId(
    organizationId: EntityId,
    options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserAggregate>>;

  /**
   * 根据部门ID查找用户列表
   *
   * @param departmentId - 部门ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByDepartmentId(
    departmentId: EntityId,
    options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserAggregate>>;

  /**
   * 检查用户是否存在
   *
   * @param id - 用户ID
   * @returns Promise<boolean>
   */
  exists(id: EntityId): Promise<boolean>;

  /**
   * 检查用户名是否存在
   *
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @returns Promise<boolean>
   */
  existsByUsername(tenantId: TenantId, username: string): Promise<boolean>;

  /**
   * 检查邮箱是否存在
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱地址
   * @returns Promise<boolean>
   */
  existsByEmail(tenantId: TenantId, email: string): Promise<boolean>;

  /**
   * 统计用户数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  countByTenantId(
    tenantId: TenantId,
    options?: UserQueryOptions,
  ): Promise<number>;

  /**
   * 软删除用户
   *
   * @param id - 用户ID
   * @param deletedBy - 删除者
   * @param deleteReason - 删除原因（可选）
   * @returns Promise<void>
   */
  softDelete(
    id: EntityId,
    deletedBy: string,
    deleteReason?: string,
  ): Promise<void>;

  /**
   * 删除所有用户
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  deleteAll(tenantId: TenantId): Promise<void>;
}
