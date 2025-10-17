/**
 * 部门仓储接口
 *
 * @description 定义部门数据访问的抽象接口，支持CRUD操作和复杂查询
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { DepartmentAggregate } from "../aggregates/department-aggregate.js";
import { DepartmentLevel } from "../value-objects/types/department-level.vo.js";
import { IPaginatedResult } from "./base/repository.interface.js";

/**
 * 部门查询选项接口
 */
export interface DepartmentQueryOptions {
  /** 租户ID */
  tenantId?: TenantId;
  
  /** 部门层级 */
  level?: DepartmentLevel;
  
  /** 父部门ID */
  parentId?: EntityId;
  
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
}

/**
 * 部门仓储接口
 *
 * @description 定义部门数据访问的抽象接口，支持CRUD操作和复杂查询
 */
export interface IDepartmentRepository {
  /**
   * 保存部门聚合根
   *
   * @param department - 部门聚合根
   * @returns Promise<void>
   */
  save(department: DepartmentAggregate): Promise<void>;

  /**
   * 根据ID查找部门
   *
   * @param id - 部门ID
   * @returns Promise<部门聚合根 | null>
   */
  findById(id: EntityId): Promise<DepartmentAggregate | null>;

  /**
   * 根据名称查找部门
   *
   * @param tenantId - 租户ID
   * @param name - 部门名称
   * @param parentId - 父部门ID（可选）
   * @returns Promise<部门聚合根 | null>
   */
  findByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<DepartmentAggregate | null>;

  /**
   * 根据租户ID查找部门列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByTenantId(
    tenantId: TenantId,
    options?: DepartmentQueryOptions,
  ): Promise<IPaginatedResult<DepartmentAggregate>>;

  /**
   * 根据父部门ID查找子部门
   *
   * @param parentId - 父部门ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  findByParentId(
    parentId: EntityId,
    options?: DepartmentQueryOptions,
  ): Promise<IPaginatedResult<DepartmentAggregate>>;

  /**
   * 检查部门是否存在
   *
   * @param id - 部门ID
   * @returns Promise<boolean>
   */
  exists(id: EntityId): Promise<boolean>;

  /**
   * 检查部门名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 部门名称
   * @param parentId - 父部门ID（可选）
   * @returns Promise<boolean>
   */
  existsByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<boolean>;

  /**
   * 统计部门数量
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<number>
   */
  countByTenantId(
    tenantId: TenantId,
    options?: DepartmentQueryOptions,
  ): Promise<number>;

  /**
   * 软删除部门
   *
   * @param id - 部门ID
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
   * 删除所有部门
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  deleteAll(tenantId: TenantId): Promise<void>;
}