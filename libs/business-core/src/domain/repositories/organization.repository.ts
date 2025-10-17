/**
 * 组织仓储接口
 *
 * @description 定义组织数据访问的抽象接口，支持CRUD操作和复杂查询
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { OrganizationAggregate } from "../aggregates/organization-aggregate.js";
import { OrganizationType } from "../value-objects/types/organization-type.vo.js";
import { IPaginatedResult } from "./base/repository.interface.js";

/**
 * 组织查询选项接口
 */
export interface OrganizationQueryOptions {
  /** 租户ID */
  tenantId?: TenantId;
  
  /** 组织类型 */
  type?: OrganizationType;
  
  /** 父组织ID */
  parentId?: EntityId;
  
  /** 是否包含已删除的组织 */
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
 * 组织仓储接口
 *
 * @description 定义组织数据访问的抽象接口，支持CRUD操作和复杂查询
 */
export interface IOrganizationRepository {
  /**
   * 保存组织聚合根
   *
   * @param organization - 组织聚合根
   * @returns Promise<void>
   */
  save(organization: OrganizationAggregate): Promise<void>;

  /**
   * 根据ID查找组织
   *
   * @param id - 组织ID
   * @returns Promise<组织聚合根 | null>
   */
  findById(id: EntityId): Promise<OrganizationAggregate | null>;

  /**
   * 根据名称查找组织
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param parentId - 父组织ID（可选）
   * @returns Promise<组织聚合根 | null>
   */
  findByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<OrganizationAggregate | null>;

  /**
   * 根据租户ID查找组织列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByTenantId(
    tenantId: TenantId,
    options?: OrganizationQueryOptions,
  ): Promise<IPaginatedResult<OrganizationAggregate>>;

  /**
   * 根据父组织ID查找子组织
   *
   * @param parentId - 父组织ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByParentId(
    parentId: EntityId,
    options?: OrganizationQueryOptions,
  ): Promise<IPaginatedResult<OrganizationAggregate>>;

  /**
   * 检查组织是否存在
   *
   * @param id - 组织ID
   * @returns Promise<boolean>
   */
  exists(id: EntityId): Promise<boolean>;

  /**
   * 检查组织名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param parentId - 父组织ID（可选）
   * @returns Promise<boolean>
   */
  existsByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<boolean>;

  /**
   * 统计组织数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  countByTenantId(
    tenantId: TenantId,
    options?: OrganizationQueryOptions,
  ): Promise<number>;

  /**
   * 软删除组织
   *
   * @param id - 组织ID
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
   * 删除所有组织
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  deleteAll(tenantId: TenantId): Promise<void>;
}