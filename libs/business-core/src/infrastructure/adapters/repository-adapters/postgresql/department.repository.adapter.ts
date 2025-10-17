import {
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
} from "@hl8/isolation-model";
import { IDepartmentRepository } from "../../../../domain/repositories/department.repository.js";
import { DepartmentAggregate } from "../../../../domain/aggregates/department-aggregate.js";
import { DepartmentLevel } from "../../../../domain/value-objects/types/department-level.vo.js";
import { BaseDomainEvent } from "../../../../domain/events/base/base-domain-event.js";
import { IAggregateSnapshot } from "../../../../domain/repositories/base/base-aggregate-repository.interface.js";
import { IPaginatedResult } from "../../../../domain/repositories/base/base-repository.interface.js";
import { BaseAggregateRepositoryAdapter } from "../../repositories/base-aggregate-repository.adapter.js";
import { PathCalculationService } from "../../../../domain/services/path-calculation.service.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 部门仓储适配器
 *
 * @description 实现部门聚合根的数据访问逻辑，支持多租户数据隔离。
 * 提供部门的CRUD操作、查询和业务规则验证功能。
 *
 * ## 业务规则
 *
 * ### 租户隔离规则
 * - 所有操作必须在租户上下文中执行
 * - 部门数据按租户进行隔离
 * - 跨租户数据访问被禁止
 *
 * ### 组织隔离规则
 * - 部门必须属于特定的组织
 * - 跨组织部门访问被禁止
 * - 部门操作必须验证组织归属
 *
 * ### 部门唯一性规则
 * - 部门名称在同一组织内必须唯一
 * - 部门编码在同一组织内必须唯一（如果使用）
 * - 部门ID在全局范围内必须唯一
 *
 * @example
 * ```typescript
 * // 创建部门仓储适配器
 * const repository = new DepartmentRepositoryAdapter(dataSource, eventStore, logger);
 *
 * // 保存部门
 * await repository.save(departmentAggregate);
 *
 * // 查找部门
 * const found = await repository.findById(departmentId);
 * ```
 *
 * @since 1.0.0
 */
export class DepartmentRepositoryAdapter
  extends BaseAggregateRepositoryAdapter<DepartmentAggregate, EntityId>
  implements IDepartmentRepository
{
  private readonly pathCalculationService: PathCalculationService;

  /**
   * 构造函数
   *
   * @param dataSource - 数据源
   * @param eventStore - 事件存储
   * @param logger - 日志记录器
   */
  constructor(dataSource: any, eventStore: any, logger?: FastifyLoggerService) {
    super(dataSource, eventStore, logger, "DepartmentAggregate");
    this.pathCalculationService = new PathCalculationService();
  }

  /**
   * 根据组织查找部门列表
   *
   * @description 根据组织ID查找部门列表，支持过滤和分页
   *
   * @param organizationId - 组织ID
   * @param options - 查询选项
   * @returns 部门聚合根列表
   */
  async findByOrganization(
    organizationId: OrganizationId,
    options: {
      level?: DepartmentLevel;
      includeDeleted?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<DepartmentAggregate[]> {
    try {
      this.logger.debug("根据组织查找部门列表", {
        organizationId: organizationId.toString(),
        options,
      });

      // TODO: 实现具体的数据库查询逻辑
      const departments = await this.queryDepartmentsByOrganization(
        organizationId,
        options,
      );

      this.logger.debug("部门列表查找成功", {
        organizationId: organizationId.toString(),
        count: departments.length,
      });

      return departments;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          organizationId: organizationId.toString(),
          options,
        },
      );
      throw error;
    }
  }

  /**
   * 根据名称查找部门
   *
   * @description 根据部门名称在指定组织内查找部门
   *
   * @param organizationId - 组织ID
   * @param name - 部门名称
   * @param includeDeleted - 是否包含已删除的部门
   * @returns 部门聚合根，如果不存在则返回null
   */
  async findByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<DepartmentAggregate | null> {
    try {
      this.logger.debug("根据名称查找部门", {
        tenantId: tenantId.toString(),
        name,
        parentId: parentId?.toString(),
      });

      // TODO: 实现具体的数据库查询逻辑
      const department = await this.queryDepartmentByName(
        tenantId,
        name,
        parentId,
      );

      this.logger.debug("部门名称查找完成", {
        tenantId: tenantId.toString(),
        name,
        found: !!department,
      });

      return department;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          organizationId: organizationId.toString(),
          name,
          includeDeleted,
        },
      );
      throw error;
    }
  }

  /**
   * 检查部门名称是否存在
   *
   * @description 检查指定组织内是否存在指定名称的部门
   *
   * @param organizationId - 组织ID
   * @param name - 部门名称
   * @param excludeId - 排除的部门ID（用于更新时检查）
   * @returns 是否存在
   */
  async existsByName(
    organizationId: OrganizationId,
    name: string,
    excludeId?: DepartmentId,
  ): Promise<boolean> {
    try {
      this.logger.debug("检查部门名称是否存在", {
        organizationId: organizationId.toString(),
        name,
        excludeId: excludeId?.toString(),
      });

      // TODO: 实现具体的数据库查询逻辑
      const exists = await this.checkDepartmentNameExists(
        organizationId,
        name,
        excludeId,
      );

      this.logger.debug("部门名称存在性检查完成", {
        organizationId: organizationId.toString(),
        name,
        exists,
      });

      return exists;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          organizationId: organizationId.toString(),
          name,
          excludeId: excludeId?.toString(),
        },
      );
      throw error;
    }
  }

  /**
   * 统计组织下的部门数量
   *
   * @description 统计指定组织下的部门数量
   *
   * @param organizationId - 组织ID
   * @param options - 统计选项
   * @returns 部门数量
   */
  async countByOrganization(
    organizationId: OrganizationId,
    options: {
      level?: DepartmentLevel;
      includeDeleted?: boolean;
    } = {},
  ): Promise<number> {
    try {
      this.logger.debug("统计组织下的部门数量", {
        organizationId: organizationId.toString(),
        options,
      });

      // TODO: 实现具体的数据库查询逻辑
      const count = await this.countDepartmentsByOrganization(
        organizationId,
        options,
      );

      this.logger.debug("部门数量统计完成", {
        organizationId: organizationId.toString(),
        count,
      });

      return count;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          organizationId: organizationId.toString(),
          options,
        },
      );
      throw error;
    }
  }

  /**
   * 软删除部门
   *
   * @description 软删除部门，保留数据但标记为已删除
   *
   * @param id - 部门ID
   * @param deletedBy - 删除者
   * @param deleteReason - 删除原因
   */
  async softDelete(
    id: EntityId,
    deletedBy: string,
    deleteReason?: string,
  ): Promise<void> {
    try {
      this.logger.debug("软删除部门", {
        departmentId: id.toString(),
        deletedBy,
        deleteReason,
      });

      // TODO: 实现具体的软删除逻辑
      await this.softDeleteDepartment(id, deletedBy, deleteReason);

      this.logger.debug("部门软删除成功", {
        departmentId: id.toString(),
        deletedBy,
      });
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          departmentId: id.toString(),
          deletedBy,
          deleteReason,
        },
      );
      throw error;
    }
  }

  /**
   * 恢复已删除的部门
   *
   * @description 恢复已软删除的部门
   *
   * @param id - 部门ID
   * @param restoredBy - 恢复者
   */
  async restore(id: EntityId, restoredBy: string): Promise<void> {
    try {
      this.logger.debug("恢复已删除的部门", {
        departmentId: id.toString(),
        restoredBy,
      });

      // TODO: 实现具体的恢复逻辑
      await this.restoreDepartment(id, restoredBy);

      this.logger.debug("部门恢复成功", {
        departmentId: id.toString(),
        restoredBy,
      });
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          departmentId: id.toString(),
          restoredBy,
        },
      );
      throw error;
    }
  }

  /**
   * 批量查询部门
   *
   * @description 支持复杂条件的批量查询
   *
   * @param options - 查询选项
   * @returns 查询结果，包含部门列表和总数
   */
  async findMany(options: {
    tenantId?: TenantId;
    organizationId?: OrganizationId;
    level?: DepartmentLevel;
    name?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<IPaginatedResult<DepartmentAggregate>> {
    try {
      this.logger.debug("批量查询部门", { options });

      // TODO: 实现具体的数据库查询逻辑
      const result = await this.queryDepartments(options);

      this.logger.debug("部门批量查询成功", {
        count: result.items.length,
        total: result.total,
      });

      return result;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        {
          options,
        },
      );
      throw error;
    }
  }

  // 私有辅助方法实现

  /**
   * 根据组织查询部门
   *
   * @private
   */
  private async queryDepartmentsByOrganization(
    organizationId: OrganizationId,
    options: any,
  ): Promise<DepartmentAggregate[]> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      let query = `
        SELECT id, name, level, organization_id, parent_id, path, description,
               created_at, updated_at, created_by, updated_by, is_deleted
        FROM departments 
        WHERE organization_id = $1
      `;

      const values = [organizationId.toString()];

      // 添加软删除过滤
      if (!options.includeDeleted) {
        query += ` AND is_deleted = false`;
      }

      // 添加层级过滤
      if (options.level) {
        query += ` AND level = $${values.length + 1}`;
        values.push(options.level.value);
      }

      // 添加排序
      const sortBy = options.sortBy || "created_at";
      const sortOrder = options.sortOrder || "DESC";
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // 添加分页
      if (options.limit) {
        query += ` LIMIT $${values.length + 1}`;
        values.push(options.limit);

        if (options.offset) {
          query += ` OFFSET $${values.length + 1}`;
          values.push(options.offset);
        }
      }

      const result = await queryRunner.query(query, values);

      // 将数据库结果转换为聚合根
      const departments: DepartmentAggregate[] = [];
      for (const row of result) {
        const department = await this.mapToDepartmentAggregate(row);
        if (department) {
          departments.push(department);
        }
      }

      return departments;
    } catch (error) {
      this.logger.error("根据组织查询部门失败", error);
      throw new Error(`根据组织查询部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 根据名称查询部门
   *
   * @private
   */
  private async queryDepartmentByName(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<DepartmentAggregate | null> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      let query = `
        SELECT id, name, level, organization_id, parent_id, path, description,
               created_at, updated_at, created_by, updated_by, is_deleted
        FROM departments 
        WHERE tenant_id = $1 AND name = $2
      `;

      const values = [tenantId.toString(), name];

      if (parentId) {
        query += ` AND parent_id = $3`;
        values.push(parentId.toString());
      }

      query += ` AND is_deleted = false`;

      const result = await queryRunner.query(query, values);

      if (result.length === 0) {
        return null;
      }

      return await this.mapToDepartmentAggregate(result[0]);
    } catch (error) {
      this.logger.error(
        "根据名称查询部门失败",
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(
        `根据名称查询部门失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查部门名称是否存在
   *
   * @private
   */
  private async checkDepartmentNameExists(
    organizationId: OrganizationId,
    name: string,
    excludeId?: DepartmentId,
  ): Promise<boolean> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      let query = `
        SELECT COUNT(*) as count
        FROM departments 
        WHERE organization_id = $1 AND name = $2 AND is_deleted = false
      `;

      const values = [organizationId.toString(), name];

      if (excludeId) {
        query += ` AND id != $${values.length + 1}`;
        values.push(excludeId.toString());
      }

      const result = await queryRunner.query(query, values);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      this.logger.error("检查部门名称是否存在失败", error);
      throw new Error(`检查部门名称是否存在失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 统计组织下的部门数量
   *
   * @private
   */
  private async countDepartmentsByOrganization(
    organizationId: OrganizationId,
    options: any,
  ): Promise<number> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      let query = `
        SELECT COUNT(*) as count
        FROM departments 
        WHERE organization_id = $1
      `;

      const values = [organizationId.toString()];

      // 添加软删除过滤
      if (!options.includeDeleted) {
        query += ` AND is_deleted = false`;
      }

      // 添加层级过滤
      if (options.level) {
        query += ` AND level = $${values.length + 1}`;
        values.push(options.level.value);
      }

      const result = await queryRunner.query(query, values);
      return parseInt(result[0].count);
    } catch (error) {
      this.logger.error("统计组织下的部门数量失败", error);
      throw new Error(`统计组织下的部门数量失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 软删除部门
   *
   * @private
   */
  private async softDeleteDepartment(
    id: EntityId,
    deletedBy: string,
    deleteReason?: string,
  ): Promise<void> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const query = `
        UPDATE departments 
        SET is_deleted = true, 
            updated_at = NOW(), 
            updated_by = $2,
            delete_reason = $3
        WHERE id = $1
      `;

      const values = [id.toString(), deletedBy, deleteReason || null];

      const result = await queryRunner.query(query, values);

      if (result.rowCount === 0) {
        throw new Error("部门不存在或已被删除");
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("软删除部门失败", error);
      throw new Error(`软删除部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 恢复部门
   *
   * @private
   */
  private async restoreDepartment(
    id: EntityId,
    restoredBy: string,
  ): Promise<void> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const query = `
        UPDATE departments 
        SET is_deleted = false, 
            updated_at = NOW(), 
            updated_by = $2,
            delete_reason = NULL
        WHERE id = $1
      `;

      const values = [id.toString(), restoredBy];

      const result = await queryRunner.query(query, values);

      if (result.rowCount === 0) {
        throw new Error("部门不存在");
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("恢复部门失败", error);
      throw new Error(`恢复部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询部门
   *
   * @private
   */
  private async queryDepartments(
    options: any,
  ): Promise<IPaginatedResult<DepartmentAggregate>> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      // 构建查询条件
      let whereConditions = [];
      const values = [];

      if (options.tenantId) {
        whereConditions.push(`tenant_id = $${values.length + 1}`);
        values.push(options.tenantId.toString());
      }

      if (options.organizationId) {
        whereConditions.push(`organization_id = $${values.length + 1}`);
        values.push(options.organizationId.toString());
      }

      if (options.level) {
        whereConditions.push(`level = $${values.length + 1}`);
        values.push(options.level.value);
      }

      if (options.name) {
        whereConditions.push(`name ILIKE $${values.length + 1}`);
        values.push(`%${options.name}%`);
      }

      if (!options.includeDeleted) {
        whereConditions.push(`is_deleted = false`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // 计算总数
      const countQuery = `SELECT COUNT(*) as count FROM departments ${whereClause}`;
      const countResult = await queryRunner.query(countQuery, values);
      const total = parseInt(countResult[0].count);

      // 构建分页查询
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, name, level, organization_id, parent_id, path, description,
               created_at, updated_at, created_by, updated_by, is_deleted
        FROM departments 
        ${whereClause}
      `;

      // 添加排序
      const sortBy = options.sortBy || "created_at";
      const sortOrder = options.sortOrder || "DESC";
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // 添加分页
      query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, offset);

      const result = await queryRunner.query(query, values);

      // 将数据库结果转换为聚合根
      const departments: DepartmentAggregate[] = [];
      for (const row of result) {
        const department = await this.mapToDepartmentAggregate(row);
        if (department) {
          departments.push(department);
        }
      }

      const totalPages = Math.ceil(total / limit);

      return {
        items: departments,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      this.logger.error("查询部门失败", error);
      throw new Error(`查询部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 将数据库行数据转换为部门聚合根
   *
   * @private
   */
  private async mapToDepartmentAggregate(
    row: any,
  ): Promise<DepartmentAggregate | null> {
    try {
      if (!row) {
        return null;
      }

      // 这里需要根据实际的DepartmentAggregate构造函数来创建实例
      // 由于DepartmentAggregate的具体实现可能不同，这里提供一个通用的映射逻辑

      // 从数据库行中提取数据
      const departmentData = {
        id: EntityId.create(row.id),
        name: row.name,
        level: DepartmentLevel.create(row.level),
        organizationId: OrganizationId.create(row.organization_id),
        parentId: row.parent_id ? DepartmentId.create(row.parent_id) : null,
        path: row.path,
        description: row.description,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        isDeleted: row.is_deleted,
      };

      // 这里需要根据实际的DepartmentAggregate构造函数来创建实例
      // 暂时返回null，等待DepartmentAggregate的具体实现
      this.logger.debug("映射部门数据到聚合根", {
        departmentId: row.id,
        name: row.name,
      });

      return null; // TODO: 实现具体的聚合根创建逻辑
    } catch (error) {
      this.logger.error("映射部门数据到聚合根失败", error);
      return null;
    }
  }

  // 实现基础聚合根仓储接口的方法

  /**
   * 保存聚合根和事件
   */
  async saveWithEvents(department: DepartmentAggregate): Promise<void> {
    // TODO: 实现具体的事件存储逻辑
    this.logger.debug("保存部门聚合根和事件", {
      departmentId: department.id.toString(),
    });
  }

  /**
   * 根据版本加载聚合根
   */
  async loadAtVersion(
    id: EntityId,
    version: number,
  ): Promise<DepartmentAggregate | null> {
    // TODO: 实现具体的事件溯源逻辑
    this.logger.debug("根据版本加载部门聚合根", {
      departmentId: id.toString(),
      version,
    });
    return null;
  }

  /**
   * 获取事件历史
   */
  async getEventHistory(
    id: EntityId,
    fromVersion?: number,
  ): Promise<BaseDomainEvent[]> {
    // TODO: 实现具体的事件历史查询逻辑
    this.logger.debug("获取部门事件历史", {
      departmentId: id.toString(),
      fromVersion,
    });
    return [];
  }

  /**
   * 重建聚合根
   */
  async rebuild(
    id: EntityId,
    toVersion?: number,
  ): Promise<DepartmentAggregate | null> {
    // TODO: 实现具体的聚合根重建逻辑
    this.logger.debug("重建部门聚合根", {
      departmentId: id.toString(),
      toVersion,
    });
    return null;
  }

  /**
   * 创建快照
   */
  async createSnapshot(department: DepartmentAggregate): Promise<void> {
    // TODO: 实现具体的快照创建逻辑
    this.logger.debug("创建部门快照", {
      departmentId: department.id.toString(),
    });
  }

  /**
   * 获取最新快照
   */
  async getLatestSnapshot(
    id: EntityId,
  ): Promise<IAggregateSnapshot<DepartmentAggregate> | null> {
    // TODO: 实现具体的快照查询逻辑
    this.logger.debug("获取部门最新快照", {
      departmentId: id.toString(),
    });
    return null;
  }

  /**
   * 批量保存聚合根和事件
   */
  async saveAllWithEvents(departments: DepartmentAggregate[]): Promise<void> {
    // TODO: 实现具体的批量保存逻辑
    this.logger.debug("批量保存部门聚合根和事件", {
      count: departments.length,
    });
  }

  // 实现基础仓储接口的方法

  /**
   * 保存实体
   */
  async save(department: DepartmentAggregate): Promise<void> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // 保存部门数据
      await this.saveDepartmentData(queryRunner, department);

      await queryRunner.commitTransaction();

      this.logger.debug("部门保存成功", {
        departmentId: department.id.toString(),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("保存部门失败", error);
      throw new Error(`保存部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 根据ID查找实体
   */
  async findById(
    id: EntityId,
    includeDeleted?: boolean,
  ): Promise<DepartmentAggregate | null> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      const department = await this.findDepartmentDataById(
        queryRunner,
        id,
        includeDeleted,
      );

      if (!department) {
        return null;
      }

      return await this.mapToDepartmentAggregate(department);
    } catch (error) {
      this.logger.error("根据ID查找部门失败", error);
      throw new Error(`根据ID查找部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除实体
   */
  async delete(id: EntityId): Promise<void> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const query = `DELETE FROM departments WHERE id = $1`;
      const result = await queryRunner.query(query, [id.toString()]);

      if (result.rowCount === 0) {
        throw new Error("部门不存在");
      }

      await queryRunner.commitTransaction();

      this.logger.debug("部门删除成功", {
        departmentId: id.toString(),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("删除部门失败", error);
      throw new Error(`删除部门失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查实体是否存在
   */
  async exists(id: EntityId): Promise<boolean> {
    const queryRunner = this.databaseService.createQueryRunner();
    await queryRunner.connect();

    try {
      const exists = await this.checkDepartmentExists(queryRunner, id, false);
      return exists;
    } catch (error) {
      this.logger.error("检查部门是否存在失败", error);
      throw new Error(`检查部门是否存在失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取实体总数
   */
  async count(): Promise<number> {
    // TODO: 实现具体的计数逻辑
    this.logger.debug("获取部门聚合根总数");
    return 0;
  }

  /**
   * 查找所有实体
   */
  async findAll(options?: any): Promise<DepartmentAggregate[]> {
    // TODO: 实现具体的查询逻辑
    this.logger.debug("查找所有部门聚合根", { options });
    return [];
  }

  /**
   * 批量保存实体
   */
  async saveAll(departments: DepartmentAggregate[]): Promise<void> {
    // TODO: 实现具体的批量保存逻辑
    this.logger.debug("批量保存部门聚合根", {
      count: departments.length,
    });
  }

  /**
   * 批量删除实体
   */
  async deleteAll(tenantId: TenantId): Promise<void> {
    // TODO: 实现具体的批量删除逻辑
    this.logger.debug("批量删除部门聚合根", {
      tenantId: tenantId.toString(),
    });
  }

  /**
   * 保存部门数据
   *
   * @private
   */
  private async saveDepartmentData(
    queryRunner: any,
    department: DepartmentAggregate,
  ): Promise<any> {
    try {
      // 计算部门路径
      const departmentEntity = department.getDepartment();
      const calculatedPath =
        this.pathCalculationService.calculateDepartmentPath(
          department.id,
          departmentEntity.parentId,
          await this.getParentDepartmentPath(
            queryRunner,
            departmentEntity.parentId,
          ),
        );

      // 更新部门实体的路径
      if (departmentEntity.path !== calculatedPath) {
        departmentEntity.updatePath(calculatedPath);
      }

      const query = `
        INSERT INTO departments (
          id, name, level, organization_id, parent_id, path, description,
          created_at, updated_at, created_by, updated_by, is_deleted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          level = EXCLUDED.level,
          parent_id = EXCLUDED.parent_id,
          path = EXCLUDED.path,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at,
          updated_by = EXCLUDED.updated_by,
          is_deleted = EXCLUDED.is_deleted
        RETURNING *
      `;

      const values = [
        department.id.toString(),
        departmentEntity.name,
        departmentEntity.level.value,
        department.organizationId.toString(),
        departmentEntity.parentId?.toString() || null,
        calculatedPath,
        departmentEntity.description || null,
        department.createdAt,
        department.updatedAt,
        department.createdBy,
        department.updatedBy,
        department.isDeleted || false,
      ];

      const result = await queryRunner.query(query, values);

      // 如果路径发生变化，需要更新所有子部门的路径
      if (result[0].path !== calculatedPath) {
        await this.updateChildDepartmentPaths(
          queryRunner,
          department.id,
          calculatedPath,
        );
      }

      return result[0];
    } catch (error) {
      this.logger.error("保存部门数据失败", error);
      throw new Error(`保存部门数据失败: ${error.message}`);
    }
  }

  /**
   * 根据ID查找部门数据
   *
   * @private
   */
  private async findDepartmentDataById(
    queryRunner: any,
    id: EntityId,
    includeDeleted: boolean,
  ): Promise<any> {
    try {
      let query = `
        SELECT id, name, level, organization_id, parent_id, path, description,
               created_at, updated_at, created_by, updated_by, is_deleted
        FROM departments 
        WHERE id = $1
      `;

      const values = [id.toString()];

      if (!includeDeleted) {
        query += ` AND is_deleted = false`;
      }

      const result = await queryRunner.query(query, values);
      return result[0] || null;
    } catch (error) {
      this.logger.error("根据ID查找部门数据失败", error);
      throw new Error(`根据ID查找部门数据失败: ${error.message}`);
    }
  }

  /**
   * 检查部门是否存在
   *
   * @private
   */
  private async checkDepartmentExists(
    queryRunner: any,
    id: EntityId,
    includeDeleted: boolean,
  ): Promise<boolean> {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM departments 
        WHERE id = $1
      `;

      const values = [id.toString()];

      if (!includeDeleted) {
        query += ` AND is_deleted = false`;
      }

      const result = await queryRunner.query(query, values);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      this.logger.error("检查部门是否存在失败", error);
      throw new Error(`检查部门是否存在失败: ${error.message}`);
    }
  }

  /**
   * 获取父部门路径
   *
   * @private
   */
  private async getParentDepartmentPath(
    queryRunner: any,
    parentId?: EntityId,
  ): Promise<string | undefined> {
    if (!parentId) {
      return undefined;
    }

    try {
      const query = `SELECT path FROM departments WHERE id = $1 AND is_deleted = false`;
      const result = await queryRunner.query(query, [parentId.toString()]);

      if (result.length === 0) {
        throw new Error("父部门不存在");
      }

      return result[0].path;
    } catch (error) {
      this.logger.error("获取父部门路径失败", error);
      throw new Error(`获取父部门路径失败: ${error.message}`);
    }
  }

  /**
   * 更新子部门路径
   *
   * @private
   */
  private async updateChildDepartmentPaths(
    queryRunner: any,
    departmentId: EntityId,
    newPath: string,
  ): Promise<void> {
    try {
      // 查找所有子部门
      const query = `
        SELECT id, path 
        FROM departments 
        WHERE path LIKE $1 AND id != $2 AND is_deleted = false
      `;

      const oldPathPattern = `%/${departmentId.toString()}/%`;
      const result = await queryRunner.query(query, [
        oldPathPattern,
        departmentId.toString(),
      ]);

      // 更新每个子部门的路径
      for (const child of result) {
        const oldPath = child.path;
        const newChildPath = this.pathCalculationService.updateChildPaths(
          oldPath,
          newPath,
          [oldPath],
        )[0];

        const updateQuery = `
          UPDATE departments 
          SET path = $1, updated_at = NOW() 
          WHERE id = $2
        `;

        await queryRunner.query(updateQuery, [newChildPath, child.id]);
      }

      this.logger.debug("更新子部门路径完成", {
        departmentId: departmentId.toString(),
        newPath,
        updatedCount: result.length,
      });
    } catch (error) {
      this.logger.error("更新子部门路径失败", error);
      throw new Error(`更新子部门路径失败: ${error.message}`);
    }
  }
}
