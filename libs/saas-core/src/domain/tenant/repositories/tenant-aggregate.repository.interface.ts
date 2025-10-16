/**
 * 租户聚合根仓储接口
 *
 * @description 定义租户聚合根的数据访问接口
 *
 * ## 业务规则
 *
 * ### 租户唯一性
 * - 租户代码全局唯一
 * - 租户域名全局唯一
 * - 支持按代码和域名查询
 *
 * ### 查询功能
 * - 支持按ID查询
 * - 支持按代码查询
 * - 支持按域名查询
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
 * class TenantRepository implements ITenantAggregateRepository {
 *   async findById(id: EntityId): Promise<TenantAggregate | null> {
 *     // 实现
 *   }
 * }
 * ```
 *
 * @interface ITenantAggregateRepository
 * @since 1.0.0
 */

import { IRepository } from "@hl8/business-core";
import { EntityId } from "@hl8/isolation-model/index.js";
import { TenantAggregate } from "../aggregates/tenant.aggregate.js";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantDomain } from "../value-objects/tenant-domain.vo.js";
import { TenantType } from "../value-objects/tenant-type.enum.js";

/**
 * 租户查询条件
 */
export interface TenantQueryConditions {
  /** 租户状态 */
  status?: string;
  /** 租户类型 */
  type?: TenantType;
  /** 创建时间范围 */
  createdAtRange?: {
    from: Date;
    to: Date;
  };
  /** 是否包含已删除 */
  includeDeleted?: boolean;
}

/**
 * 租户列表查询参数
 */
export interface TenantListQuery {
  /** 分页参数 */
  page: number;
  pageSize: number;
  /** 排序字段 */
  sortBy?: "createdAt" | "updatedAt" | "name" | "code";
  /** 排序方向 */
  sortOrder?: "asc" | "desc";
  /** 查询条件 */
  conditions?: TenantQueryConditions;
  /** 关键词搜索 */
  keyword?: string;
}

/**
 * 租户列表查询结果
 */
export interface TenantListResult {
  /** 租户列表 */
  items: TenantAggregate[];
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
 * 租户聚合根仓储接口
 */
export interface ITenantAggregateRepository
  extends IRepository<TenantAggregate, EntityId> {
  /**
   * 根据租户代码查找租户
   *
   * @description 根据租户代码查找唯一的租户聚合根
   * @param code - 租户代码
   * @returns 租户聚合根，如果不存在则返回 null
   */
  findByCode(code: TenantCode): Promise<TenantAggregate | null>;

  /**
   * 根据租户域名查找租户
   *
   * @description 根据租户域名查找唯一的租户聚合根
   * @param domain - 租户域名
   * @returns 租户聚合根，如果不存在则返回 null
   */
  findByDomain(domain: TenantDomain): Promise<TenantAggregate | null>;

  /**
   * 检查租户代码是否已存在
   *
   * @description 检查指定的租户代码是否已被使用
   * @param code - 租户代码
   * @param excludeId - 排除的租户ID（用于更新时检查）
   * @returns 是否存在
   */
  existsByCode(code: TenantCode, excludeId?: EntityId): Promise<boolean>;

  /**
   * 检查租户域名是否已存在
   *
   * @description 检查指定的租户域名是否已被使用
   * @param domain - 租户域名
   * @param excludeId - 排除的租户ID（用于更新时检查）
   * @returns 是否存在
   */
  existsByDomain(domain: TenantDomain, excludeId?: EntityId): Promise<boolean>;

  /**
   * 分页查询租户列表
   *
   * @description 根据查询条件分页获取租户列表
   * @param query - 查询参数
   * @returns 查询结果
   */
  findList(query: TenantListQuery): Promise<TenantListResult>;

  /**
   * 根据状态查询租户列表
   *
   * @description 根据租户状态查询租户列表
   * @param status - 租户状态
   * @returns 租户列表
   */
  findByStatus(status: string): Promise<TenantAggregate[]>;

  /**
   * 根据类型查询租户列表
   *
   * @description 根据租户类型查询租户列表
   * @param type - 租户类型
   * @returns 租户列表
   */
  findByType(type: TenantType): Promise<TenantAggregate[]>;

  /**
   * 统计租户数量
   *
   * @description 根据条件统计租户数量
   * @param conditions - 查询条件
   * @returns 租户数量
   */
  count(conditions?: TenantQueryConditions): Promise<number>;

  /**
   * 批量保存租户
   *
   * @description 批量保存多个租户聚合根
   * @param tenants - 租户列表
   */
  saveBatch(tenants: TenantAggregate[]): Promise<void>;

  /**
   * 批量删除租户
   *
   * @description 批量删除多个租户（软删除）
   * @param ids - 租户ID列表
   * @param deletedBy - 删除操作者
   */
  deleteBatch(ids: EntityId[], deletedBy: string): Promise<void>;

  /**
   * 恢复已删除的租户
   *
   * @description 恢复软删除的租户
   * @param id - 租户ID
   * @param restoredBy - 恢复操作者
   */
  restore(id: EntityId, restoredBy: string): Promise<void>;

  /**
   * 物理删除租户
   *
   * @description 从数据库中物理删除租户（谨慎使用）
   * @param id - 租户ID
   */
  hardDelete(id: EntityId): Promise<void>;

  /**
   * 获取租户统计信息
   *
   * @description 获取租户相关的统计信息
   * @returns 统计信息
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    trial: number;
    basic: number;
    professional: number;
    enterprise: number;
    deleted: number;
  }>;
}
