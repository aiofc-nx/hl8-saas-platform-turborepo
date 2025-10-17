/**
 * 权限仓储接口
 *
 * @description 定义权限数据访问的接口
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { PermissionAggregate } from "../aggregates/permission-aggregate.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";

/**
 * 权限查询选项
 */
export interface PermissionQueryOptions {
  /** 页码 */
  page?: number;
  
  /** 每页数量 */
  limit?: number;
  
  /** 权限类型 */
  type?: PermissionType;
  
  /** 权限动作 */
  action?: PermissionAction;
  
  /** 资源标识 */
  resource?: string;
  
  /** 是否启用 */
  isActive?: boolean;
  
  /** 是否系统权限 */
  isSystemPermission?: boolean;
  
  /** 是否可编辑 */
  isEditable?: boolean;
  
  /** 权限标签 */
  tags?: string[];
  
  /** 搜索关键词 */
  search?: string;
  
  /** 排序字段 */
  sortBy?: string;
  
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
}

/**
 * 权限查询结果
 */
export interface PermissionQueryResult {
  /** 权限列表 */
  permissions: PermissionAggregate[];
  
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
 * 权限仓储接口
 *
 * @description 定义权限数据访问的接口
 *
 * ## 业务规则
 *
 * ### 数据访问规则
 * - 所有操作都必须基于租户隔离
 * - 权限数据必须支持多租户查询
 * - 权限数据必须支持分页和排序
 * - 权限数据必须支持条件查询
 *
 * ### 权限控制规则
 * - 只有有权限的用户才能访问权限数据
 * - 系统权限只能由系统管理员管理
 * - 租户权限只能由租户管理员管理
 *
 * @example
 * ```typescript
 * // 创建权限仓储
 * const permissionRepository = new PermissionRepositoryAdapter(databaseService, logger);
 * 
 * // 保存权限
 * await permissionRepository.save(permissionAggregate);
 * 
 * // 查询权限
 * const permission = await permissionRepository.findById(tenantId, permissionId);
 * 
 * // 查询权限列表
 * const result = await permissionRepository.findMany(tenantId, {
 *   page: 1,
 *   limit: 10,
 *   type: PermissionType.TENANT,
 *   action: PermissionAction.MANAGE,
 *   isActive: true
 * });
 * ```
 *
 * @since 1.0.0
 */
export interface IPermissionRepository {
  /**
   * 保存权限聚合根
   *
   * @param permissionAggregate - 权限聚合根
   * @returns Promise<void>
   */
  save(permissionAggregate: PermissionAggregate): Promise<void>;

  /**
   * 根据ID查找权限聚合根
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<PermissionAggregate | null>
   */
  findById(tenantId: TenantId, permissionId: EntityId): Promise<PermissionAggregate | null>;

  /**
   * 根据名称查找权限聚合根
   *
   * @param tenantId - 租户ID
   * @param name - 权限名称
   * @returns Promise<PermissionAggregate | null>
   */
  findByName(tenantId: TenantId, name: string): Promise<PermissionAggregate | null>;

  /**
   * 根据资源和动作查找权限聚合根
   *
   * @param tenantId - 租户ID
   * @param resource - 资源标识
   * @param action - 权限动作
   * @returns Promise<PermissionAggregate | null>
   */
  findByResourceAndAction(tenantId: TenantId, resource: string, action: PermissionAction): Promise<PermissionAggregate | null>;

  /**
   * 查询权限列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findMany(tenantId: TenantId, options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 根据类型查询权限列表
   *
   * @param tenantId - 租户ID
   * @param type - 权限类型
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findByType(tenantId: TenantId, type: PermissionType, options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 根据动作查询权限列表
   *
   * @param tenantId - 租户ID
   * @param action - 权限动作
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findByAction(tenantId: TenantId, action: PermissionAction, options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 根据资源查询权限列表
   *
   * @param tenantId - 租户ID
   * @param resource - 资源标识
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findByResource(tenantId: TenantId, resource: string, options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 根据标签查询权限列表
   *
   * @param tenantId - 租户ID
   * @param tags - 标签列表
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findByTags(tenantId: TenantId, tags: string[], options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 根据父权限查询子权限列表
   *
   * @param tenantId - 租户ID
   * @param parentPermissionId - 父权限ID
   * @param options - 查询选项
   * @returns Promise<PermissionQueryResult>
   */
  findByParentPermission(tenantId: TenantId, parentPermissionId: EntityId, options?: PermissionQueryOptions): Promise<PermissionQueryResult>;

  /**
   * 检查权限是否存在
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<boolean>
   */
  exists(tenantId: TenantId, permissionId: EntityId): Promise<boolean>;

  /**
   * 检查权限名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 权限名称
   * @param excludePermissionId - 排除的权限ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByName(tenantId: TenantId, name: string, excludePermissionId?: EntityId): Promise<boolean>;

  /**
   * 检查资源和动作组合是否存在
   *
   * @param tenantId - 租户ID
   * @param resource - 资源标识
   * @param action - 权限动作
   * @param excludePermissionId - 排除的权限ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByResourceAndAction(tenantId: TenantId, resource: string, action: PermissionAction, excludePermissionId?: EntityId): Promise<boolean>;

  /**
   * 统计权限数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  count(tenantId: TenantId, options?: PermissionQueryOptions): Promise<number>;

  /**
   * 删除权限
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<void>
   */
  delete(tenantId: TenantId, permissionId: EntityId): Promise<void>;

  /**
   * 批量删除权限
   *
   * @param tenantId - 租户ID
   * @param permissionIds - 权限ID列表
   * @returns Promise<void>
   */
  deleteMany(tenantId: TenantId, permissionIds: EntityId[]): Promise<void>;

  /**
   * 软删除权限
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<void>
   */
  softDelete(tenantId: TenantId, permissionId: EntityId): Promise<void>;

  /**
   * 恢复软删除的权限
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<void>
   */
  restore(tenantId: TenantId, permissionId: EntityId): Promise<void>;

  /**
   * 检查权限是否被使用
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<boolean>
   */
  isInUse(tenantId: TenantId, permissionId: EntityId): Promise<boolean>;

  /**
   * 获取权限的使用统计
   *
   * @param tenantId - 租户ID
   * @param permissionId - 权限ID
   * @returns Promise<{ roleCount: number; userCount: number }>
   */
  getUsageStats(tenantId: TenantId, permissionId: EntityId): Promise<{ roleCount: number; userCount: number }>;
}
