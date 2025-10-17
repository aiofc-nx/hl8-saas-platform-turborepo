import { EntityId } from "@hl8/isolation-model";
import { TenantAggregate } from "../aggregates/tenant-aggregate.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { IAggregateRepository } from "./base/base-aggregate-repository.interface.js";
import {
  IRepositoryQueryOptions,
  IPaginatedResult,
} from "./base/base-repository.interface.js";

/**
 * 租户仓储接口
 *
 * @description 定义租户聚合根的持久化操作接口，遵循仓储模式。
 * 提供租户的CRUD操作、查询功能和业务规则验证。
 *
 * ## 业务规则
 *
 * ### 租户唯一性规则
 * - 租户名称在同一平台内必须唯一
 * - 租户ID在全局范围内必须唯一
 * - 软删除的租户名称可以被新租户使用
 * - 租户唯一性验证应在保存前执行
 *
 * ### 租户查询规则
 * - 支持按平台ID过滤租户
 * - 支持按租户类型过滤租户
 * - 支持按租户状态过滤租户（活跃/已删除）
 * - 支持分页和排序查询
 *
 * ### 租户隔离规则
 * - 租户数据必须按平台隔离
 * - 跨平台租户查询被禁止
 * - 租户操作必须验证平台归属
 * - 租户删除需要验证依赖关系
 *
 * @example
 * ```typescript
 * // 创建租户
 * const tenant = await tenantRepository.save(tenantAggregate);
 *
 * // 查询租户
 * const tenant = await tenantRepository.findById(tenantId);
 * const tenants = await tenantRepository.findByPlatform(platformId);
 *
 * // 验证唯一性
 * const exists = await tenantRepository.existsByName(platformId, name);
 * ```
 *
 * @since 1.0.0
 */
export interface ITenantRepository
  extends IAggregateRepository<TenantAggregate, EntityId> {
  /**
   * 根据平台ID查找租户列表
   *
   * @description 查找指定平台下的所有租户，支持过滤和分页。
   *
   * ## 业务规则
   *
   * ### 查询规则
   * - 默认只返回活跃的租户
   * - 支持按租户类型过滤
   * - 支持按租户状态过滤
   * - 支持分页和排序
   *
   * ### 性能规则
   * - 大量租户时使用分页查询
   * - 支持索引优化查询性能
   * - 避免全表扫描操作
   *
   * @param platformId - 平台ID
   * @param options - 查询选项
   * @returns Promise<租户聚合根列表>
   *
   * @example
   * ```typescript
   * const tenants = await tenantRepository.findByPlatform(platformId, {
   *   type: TenantType.ENTERPRISE,
   *   includeDeleted: false,
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  findByPlatform(
    platformId: EntityId,
    options?: {
      type?: TenantType;
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<TenantAggregate[]>;

  /**
   * 根据租户名称查找租户
   *
   * @description 在指定平台下根据租户名称查找租户。
   *
   * ## 业务规则
   *
   * ### 查询规则
   * - 租户名称在同一平台内必须唯一
   * - 支持精确匹配查询
   * - 支持大小写不敏感查询
   * - 查询结果最多返回一个租户
   *
   * @param platformId - 平台ID
   * @param name - 租户名称
   * @param includeDeleted - 是否包含已删除的租户，默认false
   * @returns Promise<租户聚合根 | null>
   *
   * @example
   * ```typescript
   * const tenant = await tenantRepository.findByName(platformId, '企业租户');
   * if (tenant) {
   *   console.log('找到租户:', tenant.tenant.name);
   * }
   * ```
   */
  findByName(
    platformId: EntityId,
    name: string,
    includeDeleted?: boolean,
  ): Promise<TenantAggregate | null>;

  /**
   * 检查租户名称是否存在
   *
   * @description 检查指定平台下租户名称是否已存在，用于唯一性验证。
   *
   * ## 业务规则
   *
   * ### 唯一性规则
   * - 租户名称在同一平台内必须唯一
   * - 已删除的租户名称可以被新租户使用
   * - 检查操作不区分大小写
   * - 检查操作应该是原子性的
   *
   * @param platformId - 平台ID
   * @param name - 租户名称
   * @param excludeId - 排除的租户ID（用于更新时排除自身）
   * @returns Promise<boolean>
   *
   * @example
   * ```typescript
   * const exists = await tenantRepository.existsByName(platformId, '企业租户');
   * if (exists) {
   *   throw new Error('租户名称已存在');
   * }
   * ```
   */
  existsByName(
    platformId: EntityId,
    name: string,
    excludeId?: EntityId,
  ): Promise<boolean>;

  /**
   * 统计租户数量
   *
   * @description 统计指定平台下的租户数量，支持按类型和状态统计。
   *
   * ## 业务规则
   *
   * ### 统计规则
   * - 支持按租户类型统计
   * - 支持按租户状态统计
   * - 统计结果应该是实时的
   * - 统计操作应该高效
   *
   * @param platformId - 平台ID
   * @param options - 统计选项
   * @returns Promise<租户数量>
   *
   * @example
   * ```typescript
   * const count = await tenantRepository.countByPlatform(platformId, {
   *   type: TenantType.ENTERPRISE,
   *   includeDeleted: false
   * });
   * console.log('企业租户数量:', count);
   * ```
   */
  countByPlatform(
    platformId: EntityId,
    options?: {
      type?: TenantType;
      includeDeleted?: boolean;
    },
  ): Promise<number>;

  /**
   * 软删除租户
   *
   * @description 软删除租户，将租户标记为已删除状态。
   *
   * ## 业务规则
   *
   * ### 删除规则
   * - 采用软删除方式，不物理删除数据
   * - 删除前需要验证依赖关系
   * - 删除操作需要适当的权限
   * - 删除操作应该记录审计日志
   *
   * ### 依赖验证
   * - 检查租户下是否有活跃用户
   * - 检查租户下是否有未完成的事务
   * - 检查租户下是否有重要的业务数据
   *
   * @param id - 租户ID
   * @param deletedBy - 删除者标识符
   * @param deleteReason - 删除原因
   * @returns Promise<void>
   *
   * @throws {Error} 当租户不存在时
   * @throws {Error} 当租户已被删除时
   * @throws {Error} 当存在依赖关系时
   *
   * @example
   * ```typescript
   * await tenantRepository.softDelete(tenantId, 'admin', '租户不再需要');
   * ```
   */
  softDelete(
    id: EntityId,
    deletedBy: string,
    deleteReason?: string,
  ): Promise<void>;

  /**
   * 恢复租户
   *
   * @description 恢复已删除的租户，将租户标记为活跃状态。
   *
   * ## 业务规则
   *
   * ### 恢复规则
   * - 只能恢复已删除的租户
   * - 恢复前需要验证租户名称唯一性
   * - 恢复操作需要适当的权限
   * - 恢复操作应该记录审计日志
   *
   * @param id - 租户ID
   * @param restoredBy - 恢复者标识符
   * @returns Promise<void>
   *
   * @throws {Error} 当租户不存在时
   * @throws {Error} 当租户未被删除时
   * @throws {Error} 当租户名称已存在时
   *
   * @example
   * ```typescript
   * await tenantRepository.restore(tenantId, 'admin');
   * ```
   */
  restore(id: EntityId, restoredBy: string): Promise<void>;

  /**
   * 检查租户是否存在
   *
   * @description 检查指定ID的租户是否存在。
   *
   * @param id - 租户ID
   * @param includeDeleted - 是否包含已删除的租户，默认false
   * @returns Promise<boolean>
   *
   * @example
   * ```typescript
   * const exists = await tenantRepository.exists(tenantId);
   * if (exists) {
   *   console.log('租户存在');
   * }
   * ```
   */
  exists(id: EntityId, includeDeleted?: boolean): Promise<boolean>;

  /**
   * 批量查询租户
   *
   * @description 根据查询条件批量查询租户，支持过滤、分页和排序。
   *
   * @param options - 查询选项
   * @returns Promise<{tenants: TenantAggregate[], total: number}>
   *
   * @example
   * ```typescript
   * const result = await tenantRepository.findMany({
   *   platformId: platformId,
   *   type: TenantType.ENTERPRISE,
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  findMany(options: {
    platformId?: EntityId;
    type?: TenantType;
    name?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ tenants: TenantAggregate[]; total: number }>;
}
