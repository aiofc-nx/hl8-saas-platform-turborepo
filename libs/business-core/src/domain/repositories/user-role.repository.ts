/**
 * 用户角色仓储接口
 *
 * @description 定义用户角色关联数据访问的接口
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, UserId } from "@hl8/isolation-model";
import { UserRoleAggregate } from "../aggregates/user-role-aggregate.js";
import { UserRole } from "../entities/user-role/user-role.entity.js";

/**
 * 用户角色查询选项
 */
export interface UserRoleQueryOptions {
  /** 页码 */
  page?: number;
  
  /** 每页数量 */
  limit?: number;
  
  /** 是否启用 */
  isActive?: boolean;
  
  /** 是否过期 */
  isExpired?: boolean;
  
  /** 分配者ID */
  assignedBy?: UserId;
  
  /** 分配时间范围 */
  assignedAtRange?: {
    start: Date;
    end: Date;
  };
  
  /** 过期时间范围 */
  expiresAtRange?: {
    start: Date;
    end: Date;
  };
  
  /** 搜索关键词 */
  search?: string;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
}

/**
 * 用户角色查询结果
 */
export interface UserRoleQueryResult {
  /** 用户角色关联列表 */
  userRoles: UserRoleAggregate[];
  
  /** 总数量 */
  total: number;
  
  /** 页码 */
  page: number;
  
  /** 每页数量 */
  limit: number;
  
  /** 总页数 */
  totalPages: number;
}

/**
 * 用户角色仓储接口
 *
 * @description 定义用户角色关联数据访问的接口
 *
 * ## 业务规则
 *
 * ### 数据访问规则
 * - 所有操作都必须基于租户隔离
 * - 用户角色关联数据必须支持多租户查询
 * - 用户角色关联数据必须支持分页和排序
 * - 用户角色关联数据必须支持条件查询
 *
 * ### 权限控制规则
 * - 只有有权限的用户才能访问用户角色关联数据
 * - 系统角色关联只能由系统管理员管理
 * - 租户角色关联只能由租户管理员管理
 *
 * @example
 * ```typescript
 * // 创建用户角色仓储
 * const userRoleRepository = new UserRoleRepositoryAdapter(databaseService, logger);
 * 
 * // 保存用户角色关联
 * await userRoleRepository.save(userRoleAggregate);
 * 
 * // 查询用户角色关联
 * const userRole = await userRoleRepository.findById(tenantId, userRoleId);
 * 
 * // 查询用户的所有角色
 * const userRoles = await userRoleRepository.findByUser(tenantId, userId);
 * ```
 *
 * @since 1.0.0
 */
export interface IUserRoleRepository {
  /**
   * 保存用户角色关联聚合根
   *
   * @param userRoleAggregate - 用户角色关联聚合根
   * @returns Promise<void>
   */
  save(userRoleAggregate: UserRoleAggregate): Promise<void>;

  /**
   * 根据ID查找用户角色关联聚合根
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<UserRoleAggregate | null>
   */
  findById(tenantId: TenantId, userRoleId: EntityId): Promise<UserRoleAggregate | null>;

  /**
   * 根据用户ID查找用户角色关联列表
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param options - 查询选项
   * @returns Promise<UserRoleAggregate[]>
   */
  findByUser(tenantId: TenantId, userId: UserId, options?: UserRoleQueryOptions): Promise<UserRoleAggregate[]>;

  /**
   * 根据角色ID查找用户角色关联列表
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @param options - 查询选项
   * @returns Promise<UserRoleAggregate[]>
   */
  findByRole(tenantId: TenantId, roleId: EntityId, options?: UserRoleQueryOptions): Promise<UserRoleAggregate[]>;

  /**
   * 根据用户ID和角色ID查找用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @returns Promise<UserRoleAggregate | null>
   */
  findByUserAndRole(tenantId: TenantId, userId: UserId, roleId: EntityId): Promise<UserRoleAggregate | null>;

  /**
   * 查询用户角色关联列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<UserRoleQueryResult>
   */
  findMany(tenantId: TenantId, options?: UserRoleQueryOptions): Promise<UserRoleQueryResult>;

  /**
   * 检查用户角色关联是否存在
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<boolean>
   */
  exists(tenantId: TenantId, userRoleId: EntityId): Promise<boolean>;

  /**
   * 检查用户是否有指定角色
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @returns Promise<boolean>
   */
  hasRole(tenantId: TenantId, userId: UserId, roleId: EntityId): Promise<boolean>;

  /**
   * 统计用户角色关联数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  count(tenantId: TenantId, options?: UserRoleQueryOptions): Promise<number>;

  /**
   * 统计用户的角色数量
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @returns Promise<number>
   */
  countByUser(tenantId: TenantId, userId: UserId): Promise<number>;

  /**
   * 统计角色的用户数量
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<number>
   */
  countByRole(tenantId: TenantId, roleId: EntityId): Promise<number>;

  /**
   * 删除用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<void>
   */
  delete(tenantId: TenantId, userRoleId: EntityId): Promise<void>;

  /**
   * 根据用户ID和角色ID删除用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @returns Promise<void>
   */
  deleteByUserAndRole(tenantId: TenantId, userId: UserId, roleId: EntityId): Promise<void>;

  /**
   * 批量删除用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleIds - 用户角色关联ID列表
   * @returns Promise<void>
   */
  deleteMany(tenantId: TenantId, userRoleIds: EntityId[]): Promise<void>;

  /**
   * 删除用户的所有角色关联
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @returns Promise<void>
   */
  deleteByUser(tenantId: TenantId, userId: UserId): Promise<void>;

  /**
   * 删除角色的所有用户关联
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<void>
   */
  deleteByRole(tenantId: TenantId, roleId: EntityId): Promise<void>;

  /**
   * 软删除用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<void>
   */
  softDelete(tenantId: TenantId, userRoleId: EntityId): Promise<void>;

  /**
   * 恢复软删除的用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<void>
   */
  restore(tenantId: TenantId, userRoleId: EntityId): Promise<void>;

  /**
   * 激活用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<void>
   */
  activate(tenantId: TenantId, userRoleId: EntityId): Promise<void>;

  /**
   * 停用用户角色关联
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<void>
   */
  deactivate(tenantId: TenantId, userRoleId: EntityId): Promise<void>;

  /**
   * 检查用户角色关联是否有效
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<boolean>
   */
  isValid(tenantId: TenantId, userRoleId: EntityId): Promise<boolean>;

  /**
   * 检查用户角色关联是否过期
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<boolean>
   */
  isExpired(tenantId: TenantId, userRoleId: EntityId): Promise<boolean>;

  /**
   * 获取用户角色关联的使用统计
   *
   * @param tenantId - 租户ID
   * @param userRoleId - 用户角色关联ID
   * @returns Promise<{ userCount: number; roleCount: number }>
   */
  getUsageStats(tenantId: TenantId, userRoleId: EntityId): Promise<{ userCount: number; roleCount: number }>;
}
