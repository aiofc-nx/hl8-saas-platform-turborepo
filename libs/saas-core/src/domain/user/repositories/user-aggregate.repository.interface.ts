/**
 * 用户聚合根仓储接口
 *
 * @description 定义用户聚合根的数据访问接口
 *
 * ## 业务规则
 *
 * ### 用户唯一性
 * - 同一租户内用户名唯一
 * - 同一租户内邮箱唯一
 * - 手机号全局唯一（如果提供）
 *
 * ### 查询功能
 * - 支持按ID查询
 * - 支持按用户名查询
 * - 支持按邮箱查询
 * - 支持按手机号查询
 * - 支持分页列表查询
 * - 支持按状态筛选
 *
 * ### 事务支持
 * - 支持事务性操作
 * - 支持批量操作
 * - 支持并发控制
 *
 * @example
 * ```typescript
 * class UserRepository implements IUserAggregateRepository {
 *   async findById(id: EntityId): Promise<UserAggregate | null> {
 *     // 实现
 *   }
 * }
 * ```
 *
 * @interface IUserAggregateRepository
 * @since 1.0.0
 */

import { IRepository } from "@hl8/business-core";
import { EntityId } from "@hl8/isolation-model/index.js";
import { UserAggregate } from "../aggregates/user.aggregate.js";
import { Username } from "../value-objects/username.vo.js";
import { Email } from "../value-objects/email.vo.js";
import { PhoneNumber } from "../value-objects/phone-number.vo.js";
import { UserStatus } from "../value-objects/user-status.enum.js";

/**
 * 用户查询条件
 */
export interface UserQueryConditions {
  /** 租户ID */
  tenantId: EntityId;
  /** 用户状态 */
  status?: UserStatus;
  /** 是否邮箱已验证 */
  emailVerified?: boolean;
  /** 是否手机已验证 */
  phoneVerified?: boolean;
  /** 创建时间范围 */
  createdAtRange?: {
    from: Date;
    to: Date;
  };
  /** 最后登录时间范围 */
  lastLoginRange?: {
    from: Date;
    to: Date;
  };
  /** 是否包含已删除 */
  includeDeleted?: boolean;
}

/**
 * 用户列表查询参数
 */
export interface UserListQuery {
  /** 分页参数 */
  page: number;
  pageSize: number;
  /** 排序字段 */
  sortBy?: "createdAt" | "updatedAt" | "username" | "email" | "lastLoginAt";
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
  /** 查询条件 */
  conditions: UserQueryConditions;
  /** 关键词搜索 */
  keyword?: string;
}

/**
 * 用户列表查询结果
 */
export interface UserListResult {
  /** 用户列表 */
  items: UserAggregate[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 用户聚合根仓储接口
 */
export interface IUserAggregateRepository
  extends IRepository<UserAggregate, EntityId> {
  /**
   * 根据用户名查找用户
   *
   * @description 在指定租户内根据用户名查找唯一的用户聚合根
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @returns 用户聚合根，如果不存在则返回 null
   */
  findByUsername(
    tenantId: EntityId,
    username: Username,
  ): Promise<UserAggregate | null>;

  /**
   * 根据邮箱查找用户
   *
   * @description 在指定租户内根据邮箱查找唯一的用户聚合根
   * @param tenantId - 租户ID
   * @param email - 邮箱
   * @returns 用户聚合根，如果不存在则返回 null
   */
  findByEmail(tenantId: EntityId, email: Email): Promise<UserAggregate | null>;

  /**
   * 根据手机号查找用户
   *
   * @description 根据手机号查找用户（全局唯一）
   * @param phoneNumber - 手机号
   * @returns 用户聚合根，如果不存在则返回 null
   */
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserAggregate | null>;

  /**
   * 检查用户名是否已存在
   *
   * @description 检查在指定租户内用户名是否已被使用
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @param excludeId - 排除的用户ID（用于更新时检查）
   * @returns 是否存在
   */
  existsByUsername(
    tenantId: EntityId,
    username: Username,
    excludeId?: EntityId,
  ): Promise<boolean>;

  /**
   * 检查邮箱是否已存在
   *
   * @description 检查在指定租户内邮箱是否已被使用
   * @param tenantId - 租户ID
   * @param email - 邮箱
   * @param excludeId - 排除的用户ID（用于更新时检查）
   * @returns 是否存在
   */
  existsByEmail(
    tenantId: EntityId,
    email: Email,
    excludeId?: EntityId,
  ): Promise<boolean>;

  /**
   * 检查手机号是否已存在
   *
   * @description 检查手机号是否已被使用（全局唯一）
   * @param phoneNumber - 手机号
   * @param excludeId - 排除的用户ID（用于更新时检查）
   * @returns 是否存在
   */
  existsByPhoneNumber(
    phoneNumber: PhoneNumber,
    excludeId?: EntityId,
  ): Promise<boolean>;

  /**
   * 分页查询用户列表
   *
   * @description 根据查询条件分页获取用户列表
   * @param query - 查询参数
   * @returns 查询结果
   */
  findList(query: UserListQuery): Promise<UserListResult>;

  /**
   * 根据状态查询用户列表
   *
   * @description 根据用户状态查询用户列表
   * @param tenantId - 租户ID
   * @param status - 用户状态
   * @returns 用户列表
   */
  findByStatus(
    tenantId: EntityId,
    status: UserStatus,
  ): Promise<UserAggregate[]>;

  /**
   * 根据租户查询所有用户
   *
   * @description 查询指定租户的所有用户
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  findByTenant(tenantId: EntityId): Promise<UserAggregate[]>;

  /**
   * 查询活跃用户
   *
   * @description 查询指定租户内的活跃用户
   * @param tenantId - 租户ID
   * @param limit - 限制数量
   * @returns 用户列表
   */
  findActiveUsers(tenantId: EntityId, limit?: number): Promise<UserAggregate[]>;

  /**
   * 查询最近登录的用户
   *
   * @description 查询最近登录的用户列表
   * @param tenantId - 租户ID
   * @param days - 天数
   * @param limit - 限制数量
   * @returns 用户列表
   */
  findRecentLoginUsers(
    tenantId: EntityId,
    days: number = 7,
    limit?: number,
  ): Promise<UserAggregate[]>;

  /**
   * 统计用户数量
   *
   * @description 根据条件统计用户数量
   * @param conditions - 查询条件
   * @returns 用户数量
   */
  count(conditions: UserQueryConditions): Promise<number>;

  /**
   * 批量保存用户
   *
   * @description 批量保存多个用户聚合根
   * @param users - 用户列表
   */
  saveBatch(users: UserAggregate[]): Promise<void>;

  /**
   * 批量删除用户
   *
   * @description 批量删除多个用户（软删除）
   * @param ids - 用户ID列表
   * @param deletedBy - 删除操作者
   */
  deleteBatch(ids: EntityId[], deletedBy: string): Promise<void>;

  /**
   * 恢复已删除的用户
   *
   * @description 恢复软删除的用户
   * @param id - 用户ID
   * @param restoredBy - 恢复操作者
   */
  restore(id: EntityId, restoredBy: string): Promise<void>;

  /**
   * 物理删除用户
   *
   * @description 从数据库中物理删除用户（谨慎使用）
   * @param id - 用户ID
   */
  hardDelete(id: EntityId): Promise<void>;

  /**
   * 获取用户统计信息
   *
   * @description 获取指定租户的用户统计信息
   * @param tenantId - 租户ID
   * @returns 统计信息
   */
  getStatistics(tenantId: EntityId): Promise<{
    total: number;
    active: number;
    pending: number;
    disabled: number;
    locked: number;
    expired: number;
    deleted: number;
    emailVerified: number;
    phoneVerified: number;
  }>;
}
