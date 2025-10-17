/**
 * 角色仓储接口
 *
 * @description 定义角色数据访问的接口
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { RoleAggregate } from "../aggregates/role-aggregate.js";
import { Role } from "../entities/role/role.entity.js";
import { RoleType } from "../value-objects/types/role-type.vo.js";

/**
 * 角色查询选项
 */
export interface RoleQueryOptions {
  /** 页码 */
  page?: number;
  
  /** 每页数量 */
  limit?: number;
  
  /** 角色类型 */
  type?: RoleType;
  
  /** 是否启用 */
  isActive?: boolean;
  
  /** 是否系统角色 */
  isSystemRole?: boolean;
  
  /** 是否可编辑 */
  isEditable?: boolean;
  
  /** 角色标签 */
  tags?: string[];
  
  /** 搜索关键词 */
  search?: string;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
}

/**
 * 角色查询结果
 */
export interface RoleQueryResult {
  /** 角色列表 */
  roles: RoleAggregate[];
  
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
 * 角色仓储接口
 *
 * @description 定义角色数据访问的接口
 *
 * ## 业务规则
 *
 * ### 数据访问规则
 * - 所有操作都必须基于租户隔离
 * - 角色数据必须支持多租户查询
 * - 角色数据必须支持分页和排序
 * - 角色数据必须支持条件查询
 *
 * ### 权限控制规则
 * - 只有有权限的用户才能访问角色数据
 * - 系统角色只能由系统管理员管理
 * - 租户角色只能由租户管理员管理
 *
 * @example
 * ```typescript
 * // 创建角色仓储
 * const roleRepository = new RoleRepositoryAdapter(databaseService, logger);
 * 
 * // 保存角色
 * await roleRepository.save(roleAggregate);
 * 
 * // 查询角色
 * const role = await roleRepository.findById(tenantId, roleId);
 * 
 * // 查询角色列表
 * const result = await roleRepository.findMany(tenantId, {
 *   page: 1,
 *   limit: 10,
 *   type: RoleType.TENANT,
 *   isActive: true
 * });
 * ```
 *
 * @since 1.0.0
 */
export interface IRoleRepository {
  /**
   * 保存角色聚合根
   *
   * @param roleAggregate - 角色聚合根
   * @returns Promise<void>
   */
  save(roleAggregate: RoleAggregate): Promise<void>;

  /**
   * 根据ID查找角色聚合根
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<RoleAggregate | null>
   */
  findById(tenantId: TenantId, roleId: EntityId): Promise<RoleAggregate | null>;

  /**
   * 根据名称查找角色聚合根
   *
   * @param tenantId - 租户ID
   * @param name - 角色名称
   * @returns Promise<RoleAggregate | null>
   */
  findByName(tenantId: TenantId, name: string): Promise<RoleAggregate | null>;

  /**
   * 查询角色列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<RoleQueryResult>
   */
  findMany(tenantId: TenantId, options?: RoleQueryOptions): Promise<RoleQueryResult>;

  /**
   * 根据类型查询角色列表
   *
   * @param tenantId - 租户ID
   * @param type - 角色类型
   * @param options - 查询选项
   * @returns Promise<RoleQueryResult>
   */
  findByType(tenantId: TenantId, type: RoleType, options?: RoleQueryOptions): Promise<RoleQueryResult>;

  /**
   * 根据标签查询角色列表
   *
   * @param tenantId - 租户ID
   * @param tags - 标签列表
   * @param options - 查询选项
   * @returns Promise<RoleQueryResult>
   */
  findByTags(tenantId: TenantId, tags: string[], options?: RoleQueryOptions): Promise<RoleQueryResult>;

  /**
   * 根据父角色查询子角色列表
   *
   * @param tenantId - 租户ID
   * @param parentRoleId - 父角色ID
   * @param options - 查询选项
   * @returns Promise<RoleQueryResult>
   */
  findByParentRole(tenantId: TenantId, parentRoleId: EntityId, options?: RoleQueryOptions): Promise<RoleQueryResult>;

  /**
   * 检查角色是否存在
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<boolean>
   */
  exists(tenantId: TenantId, roleId: EntityId): Promise<boolean>;

  /**
   * 检查角色名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 角色名称
   * @param excludeRoleId - 排除的角色ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByName(tenantId: TenantId, name: string, excludeRoleId?: EntityId): Promise<boolean>;

  /**
   * 统计角色数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  count(tenantId: TenantId, options?: RoleQueryOptions): Promise<number>;

  /**
   * 删除角色
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<void>
   */
  delete(tenantId: TenantId, roleId: EntityId): Promise<void>;

  /**
   * 批量删除角色
   *
   * @param tenantId - 租户ID
   * @param roleIds - 角色ID列表
   * @returns Promise<void>
   */
  deleteMany(tenantId: TenantId, roleIds: EntityId[]): Promise<void>;

  /**
   * 软删除角色
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<void>
   */
  softDelete(tenantId: TenantId, roleId: EntityId): Promise<void>;

  /**
   * 恢复软删除的角色
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<void>
   */
  restore(tenantId: TenantId, roleId: EntityId): Promise<void>;

  /**
   * 检查角色是否被使用
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<boolean>
   */
  isInUse(tenantId: TenantId, roleId: EntityId): Promise<boolean>;

  /**
   * 获取角色的使用统计
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns Promise<{ userCount: number; permissionCount: number }>
   */
  getUsageStats(tenantId: TenantId, roleId: EntityId): Promise<{ userCount: number; permissionCount: number }>;
}
