/**
 * 基础仓储适配器
 *
 * 实现领域层仓储接口，提供统一的数据持久化能力。
 * 作为通用功能组件，支持多种数据库和缓存策略。
 *
 * @description 基础仓储适配器实现领域层数据持久化需求
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { ConnectionManager } from "@hl8/database";
import { CacheService } from "@hl8/caching";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { EntityId } from "@hl8/isolation-model";
import { IEntity } from "../../../domain/entities/base/entity.interface.js";
import type {
  IRepository,
  IRepositoryQueryOptions,
} from "../../../domain/repositories/base/base-repository.interface.js";
import { EntityNotFoundError } from "../../../domain/repositories/base/base-repository.interface.js";
import { DatabaseTransaction } from "../../../shared/types/database.types.js";

/**
 * 仓储配置接口
 */
export interface IRepositoryConfig {
  /** 是否启用缓存 */
  enableCache: boolean;
  /** 缓存TTL（秒） */
  cacheTtl: number;
  /** 是否启用事务 */
  enableTransaction: boolean;
  /** 是否启用乐观锁 */
  enableOptimisticLocking: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
}

/**
 * 基础仓储适配器
 *
 * 实现领域层仓储接口
 */
@Injectable()
export class BaseRepositoryAdapter<TEntity extends IEntity, TId = EntityId>
  implements IRepository<TEntity, TId>
{
  protected readonly config: IRepositoryConfig;

  constructor(
    protected readonly databaseService: ConnectionManager,
    protected readonly cacheService: CacheService,
    protected readonly logger: FastifyLoggerService,
    protected readonly entityName: string,
    config: Partial<IRepositoryConfig> = {},
  ) {
    this.config = {
      enableCache: config.enableCache ?? true,
      cacheTtl: config.cacheTtl ?? 300,
      enableTransaction: config.enableTransaction ?? true,
      enableOptimisticLocking: config.enableOptimisticLocking ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
    };
  }

  /**
   * 根据ID查找实体
   *
   * @param id - 实体标识符
   * @returns 实体实例，如果不存在返回null
   */
  async findById(id: TId): Promise<TEntity | null> {
    try {
      // 尝试从缓存获取
      if (this.config.enableCache) {
        const cached = await this.getFromCache(id);
        if (cached) {
          this.logger.debug(`从缓存获取实体: ${this.entityName}`);
          return cached;
        }
      }

      // 从数据库获取
      const entity = await this.getFromDatabase(id);
      if (!entity) {
        return null;
      }

      // 缓存结果
      if (this.config.enableCache) {
        await this.setCache(id, entity);
      }

      this.logger.debug(`从数据库获取实体: ${this.entityName}`, {
        entityName: this.entityName,
        id: id.toString(),
        source: "database",
      });
      return entity;
    } catch (error) {
      this.logger.error(
        `查找实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
        {
          entityName: this.entityName,
          id: id.toString(),
          operation: "findById",
        },
      );
      throw new EntityNotFoundError(
        `实体不存在: ${this.entityName}`,
        this.entityName,
        String(id),
        this.entityName,
      );
    }
  }

  /**
   * 保存实体
   *
   * @param entity - 要保存的实体
   */
  async save(entity: TEntity): Promise<void> {
    try {
      await this.executeWithRetry(async () => {
        // 检查并发冲突
        if (this.config.enableOptimisticLocking) {
          await this.checkConcurrency(entity);
        }

        // 保存到数据库
        await this.saveToDatabase(entity);

        // 更新缓存
        if (this.config.enableCache) {
          await this.setCache((entity as any).getId(), entity);
        }

        this.logger.debug(`保存实体成功: ${this.entityName}`);
      });
    } catch (error) {
      this.logger.error(
        `保存实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
        {
          id: (entity as any).getId(),
        },
      );
      throw error;
    }
  }

  /**
   * 删除实体
   *
   * @param id - 要删除的实体标识符
   */
  async delete(id: TId): Promise<void> {
    try {
      await this.executeWithRetry(async () => {
        // 检查实体是否存在
        const exists = await this.exists(id);
        if (!exists) {
          throw new EntityNotFoundError(
            `实体不存在: ${this.entityName}`,
            this.entityName,
            String(id),
            this.entityName,
          );
        }

        // 从数据库删除
        await this.deleteFromDatabase(id);

        // 清除缓存
        if (this.config.enableCache) {
          await this.removeFromCache(id);
        }

        this.logger.debug(`删除实体成功: ${this.entityName}`);
      });
    } catch (error) {
      this.logger.error(
        `删除实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
        { id },
      );
      throw error;
    }
  }

  /**
   * 检查实体是否存在
   *
   * @param id - 实体标识符
   * @returns 如果存在返回true，否则返回false
   */
  async exists(id: TId): Promise<boolean> {
    try {
      // 尝试从缓存检查
      if (this.config.enableCache) {
        const cached = await this.getFromCache(id);
        if (cached) {
          return true;
        }
      }

      // 从数据库检查
      const exists = await this.existsInDatabase(id);
      return exists;
    } catch (error) {
      this.logger.error(
        `检查实体存在性失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
        {
          id,
        },
      );
      return false;
    }
  }

  /**
   * 获取实体总数
   *
   * @returns 实体总数
   */
  async count(): Promise<number> {
    try {
      return await this.countInDatabase();
    } catch (error) {
      this.logger.error(
        `获取实体总数失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 查找所有实体
   *
   * @param options - 查询选项
   * @returns 实体列表
   */
  async findAll(options?: IRepositoryQueryOptions): Promise<TEntity[]> {
    try {
      return await this.findAllFromDatabase(options);
    } catch (error) {
      this.logger.error(
        `查找所有实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 批量保存实体
   *
   * @param entities - 要保存的实体数组
   */
  async saveAll(entities: TEntity[]): Promise<void> {
    try {
      if (this.config.enableTransaction) {
        // 使用兼容性检查调用 transaction 方法
        if (typeof (this.databaseService as any).transaction === "function") {
          await (this.databaseService as any).transaction(
            async (transaction: DatabaseTransaction) => {
              for (const entity of entities) {
                await this.saveToDatabase(entity, transaction);
              }
            },
          );
        } else {
          for (const entity of entities) {
            await this.save(entity);
          }
        }
      } else {
        for (const entity of entities) {
          await this.save(entity);
        }
      }

      // 更新缓存
      if (this.config.enableCache) {
        for (const entity of entities) {
          await this.setCache((entity as any).getId(), entity);
        }
      }

      this.logger.debug(`批量保存实体成功: ${this.entityName}`);
    } catch (error) {
      this.logger.error(
        `批量保存实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 批量删除实体
   *
   * @param ids - 要删除的实体标识符数组
   */
  async deleteAll(ids: TId[]): Promise<void> {
    try {
      if (this.config.enableTransaction) {
        // 使用兼容性检查调用 transaction 方法
        if (typeof (this.databaseService as any).transaction === "function") {
          await (this.databaseService as any).transaction(
            async (transaction: DatabaseTransaction) => {
              for (const id of ids) {
                await this.deleteFromDatabase(id, transaction);
              }
            },
          );
        } else {
          for (const id of ids) {
            await this.delete(id);
          }
        }
      } else {
        for (const id of ids) {
          await this.delete(id);
        }
      }

      // 清除缓存
      if (this.config.enableCache) {
        for (const id of ids) {
          await this.removeFromCache(id);
        }
      }

      this.logger.debug(`批量删除实体成功: ${this.entityName}`);
    } catch (error) {
      this.logger.error(
        `批量删除实体失败: ${this.entityName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 执行重试逻辑
   */
  protected async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          this.logger.warn(
            `操作失败，重试中 (${attempt}/${this.config.maxRetries})`,
          );
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error("操作失败");
  }

  /**
   * 延迟执行
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 检查并发冲突
   */
  protected async checkConcurrency(_entity: TEntity): Promise<void> {
    // 实现乐观锁检查逻辑
    // 这里需要根据具体的实体类型和版本字段来实现
  }

  /**
   * 从缓存获取实体
   */
  protected async getFromCache(id: TId): Promise<TEntity | null> {
    const cacheKey = this.getCacheKey(id);
    return await this.cacheService.get<TEntity>(this.entityName, cacheKey);
  }

  /**
   * 设置缓存
   */
  protected async setCache(id: TId, entity: TEntity): Promise<void> {
    const cacheKey = this.getCacheKey(id);
    await this.cacheService.set(
      this.entityName,
      cacheKey,
      entity,
      this.config.cacheTtl,
    );
  }

  /**
   * 从缓存移除
   */
  protected async removeFromCache(id: TId): Promise<void> {
    const cacheKey = this.getCacheKey(id);
    await this.cacheService.del(this.entityName, cacheKey);
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(id: TId): string {
    return `${this.entityName}:${id}`;
  }

  /**
   * 从数据库获取实体
   */
  protected async getFromDatabase(_id: TId): Promise<TEntity | null> {
    // 实现具体的数据库查询逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库查询逻辑");
  }

  /**
   * 保存到数据库
   */
  private async saveToDatabase(
    _entity: TEntity,
    _transaction?: DatabaseTransaction,
  ): Promise<void> {
    // 实现具体的数据库保存逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库保存逻辑");
  }

  /**
   * 从数据库删除
   */
  protected async deleteFromDatabase(
    _id: TId,
    _transaction?: DatabaseTransaction,
  ): Promise<void> {
    // 实现具体的数据库删除逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库删除逻辑");
  }

  /**
   * 检查实体在数据库中是否存在
   */
  private async existsInDatabase(_id: TId): Promise<boolean> {
    // 实现具体的数据库存在性检查逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库存在性检查逻辑");
  }

  /**
   * 获取数据库中的实体总数
   */
  private async countInDatabase(): Promise<number> {
    // 实现具体的数据库计数逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库计数逻辑");
  }

  /**
   * 从数据库查找所有实体
   */
  private async findAllFromDatabase(
    _options?: IRepositoryQueryOptions,
  ): Promise<TEntity[]> {
    // 实现具体的数据库查询逻辑
    // 这里需要根据具体的数据库服务来实现
    throw new Error("需要实现具体的数据库查询逻辑");
  }
}
