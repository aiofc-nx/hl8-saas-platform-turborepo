/**
 * 事件存储实现
 *
 * 提供完整的事件存储功能，支持事件溯源、快照、压缩和分区存储。
 * 作为通用功能组件，为业务模块提供强大的事件存储能力。
 *
 * @description 事件存储的完整实现，支持多种存储后端
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type {
  IEventStore,
  EventStoreStats,
  EventStoreConfig,
} from "../../../domain/ports/event-store.port.js";
import type {
  ISnapshotStore,
  Snapshot,
} from "../../../domain/ports/snapshot-store.port.js";
// import { BaseDomainEvent } from '../../../domain/events/base/base-domain-event';
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { CacheService } from "@hl8/caching";
import { ConnectionManager } from "@hl8/database";

/**
 * 事件存储实现
 *
 * 提供完整的事件存储功能
 */
@Injectable()
export class EventStoreImplementation implements IEventStore {
  private readonly stats: EventStoreStats = {
    totalEvents: 0,
    totalAggregates: 0,
    eventsByType: {},
    eventsByTenant: {},
    averageEventsPerAggregate: 0,
    oldestEvent: new Date(),
    newestEvent: new Date(),
  };

  constructor(
    private readonly logger: FastifyLoggerService,
    private readonly cacheService: CacheService,
    private readonly databaseService: ConnectionManager,
    private readonly snapshotStore: ISnapshotStore,
    private readonly config: EventStoreConfig,
  ) {}

  /**
   * 保存事件
   *
   * @description 保存聚合的所有未提交事件，支持乐观并发控制
   * @param aggregateId - 聚合ID
   * @param events - 事件列表
   * @param expectedVersion - 期望的聚合版本号
   */
  async saveEvents(
    aggregateId: string,
    events: any[],
    expectedVersion: number,
  ): Promise<void> {
    try {
      // 1. 验证事件
      this.validateEvents(events);

      // 2. 检查并发冲突
      await this.checkConcurrencyConflict(aggregateId, expectedVersion);

      // 3. 保存事件到数据库
      await this.saveEventsToDatabase(aggregateId, events, expectedVersion);

      // 4. 更新统计信息
      this.updateStats(events);

      // 5. 清理缓存
      await this.invalidateCache(aggregateId);

      this.logger.log("事件保存成功");
    } catch (error) {
      this.logger.error(
        "事件保存失败",
        error instanceof Error ? error.stack : undefined,
        {
          aggregateId,
          eventCount: events.length,
          expectedVersion,
        },
      );
      throw error;
    }
  }

  /**
   * 获取聚合的所有事件
   *
   * @description 获取指定聚合的所有事件，支持缓存优化
   * @param aggregateId - 聚合ID
   * @returns 事件列表
   */
  async getEvents(aggregateId: string): Promise<any[]> {
    try {
      // 1. 检查缓存
      const cachedEvents = await this.getCachedEvents(aggregateId);
      if (cachedEvents) {
        return cachedEvents;
      }

      // 2. 从数据库获取事件
      const events = await this.getEventsFromDatabase(aggregateId);

      // 3. 缓存事件
      await this.cacheEvents(aggregateId, events);

      return events;
    } catch (error) {
      this.logger.error(
        "获取事件失败",
        error instanceof Error ? error.stack : undefined,
        { aggregateId },
      );
      throw error;
    }
  }

  /**
   * 从指定版本获取事件
   *
   * @description 从指定版本开始获取聚合的事件
   * @param aggregateId - 聚合ID
   * @param fromVersion - 起始版本号
   * @returns 事件列表
   */
  async getEventsFromVersion(
    aggregateId: string,
    fromVersion: number,
  ): Promise<any[]> {
    try {
      const events = await this.getEventsFromDatabase(aggregateId, fromVersion);
      return events;
    } catch (error) {
      this.logger.error(
        "从版本获取事件失败",
        error instanceof Error ? error.stack : undefined,
        {
          aggregateId,
          fromVersion,
        },
      );
      throw error;
    }
  }

  /**
   * 按事件类型获取事件
   *
   * @description 获取指定类型的事件
   * @param eventType - 事件类型
   * @param fromDate - 开始日期
   * @param toDate - 结束日期
   * @returns 事件列表
   */
  async getEventsByType(
    eventType: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<any[]> {
    try {
      const events = await this.getEventsFromDatabaseByType(
        eventType,
        fromDate,
        toDate,
      );
      return events;
    } catch (error) {
      this.logger.error(
        "按类型获取事件失败",
        error instanceof Error ? error.stack : undefined,
        {
          eventType,
          fromDate,
          toDate,
        },
      );
      throw error;
    }
  }

  /**
   * 按租户获取事件
   *
   * @description 获取指定租户的事件
   * @param tenantId - 租户ID
   * @param fromDate - 开始日期
   * @param toDate - 结束日期
   * @returns 事件列表
   */
  async getEventsByTenant(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<any[]> {
    try {
      const events = await this.getEventsFromDatabaseByTenant(
        tenantId,
        fromDate,
        toDate,
      );
      return events;
    } catch (error) {
      this.logger.error(
        "按租户获取事件失败",
        error instanceof Error ? error.stack : undefined,
        {
          tenantId,
          fromDate,
          toDate,
        },
      );
      throw error;
    }
  }

  /**
   * 获取聚合版本号
   *
   * @description 获取聚合的当前版本号
   * @param aggregateId - 聚合ID
   * @returns 版本号
   */
  async getAggregateVersion(aggregateId: string): Promise<number> {
    try {
      const version = await this.getAggregateVersionFromDatabase(aggregateId);
      return version;
    } catch (error) {
      this.logger.error(
        "获取聚合版本失败",
        error instanceof Error ? error.stack : undefined,
        { aggregateId },
      );
      throw error;
    }
  }

  /**
   * 检查聚合是否存在
   *
   * @description 检查聚合是否存在
   * @param aggregateId - 聚合ID
   * @returns 是否存在
   */
  async exists(aggregateId: string): Promise<boolean> {
    try {
      const exists = await this.checkAggregateExists(aggregateId);
      return exists;
    } catch (error) {
      this.logger.error(
        "检查聚合存在性失败",
        error instanceof Error ? error.stack : undefined,
        { aggregateId },
      );
      throw error;
    }
  }

  /**
   * 删除聚合事件
   *
   * @description 删除指定聚合的所有事件
   * @param aggregateId - 聚合ID
   */
  async deleteEvents(aggregateId: string): Promise<void> {
    try {
      await this.deleteEventsFromDatabase(aggregateId);
      await this.invalidateCache(aggregateId);

      this.logger.log("聚合事件删除成功");
    } catch (error) {
      this.logger.error(
        "删除聚合事件失败",
        error instanceof Error ? error.stack : undefined,
        { aggregateId },
      );
      throw error;
    }
  }

  /**
   * 获取事件统计信息
   *
   * @description 获取事件存储的统计信息
   * @returns 统计信息
   */
  async getStats(): Promise<EventStoreStats> {
    try {
      const stats = await this.calculateStats();
      return stats;
    } catch (error) {
      this.logger.error(
        "获取统计信息失败",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 验证事件
   */
  private validateEvents(events: any[]): void {
    if (!events || events.length === 0) {
      throw new Error("事件列表不能为空");
    }

    for (const event of events) {
      if (!event.eventId || !event.aggregateId) {
        throw new Error("事件必须包含事件ID和聚合ID");
      }
    }
  }

  /**
   * 检查并发冲突
   */
  private async checkConcurrencyConflict(
    aggregateId: string,
    expectedVersion: number,
  ): Promise<void> {
    const currentVersion =
      await this.getAggregateVersionFromDatabase(aggregateId);

    if (currentVersion !== expectedVersion) {
      throw new Error(
        `聚合 ${aggregateId} 版本冲突: 期望版本 ${expectedVersion}, 实际版本 ${currentVersion}`,
      );
    }
  }

  /**
   * 保存事件到数据库
   */
  private async saveEventsToDatabase(
    aggregateId: string,
    events: any[],
    expectedVersion: number,
  ): Promise<void> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 检查聚合是否存在
      const aggregateExists = await this.checkAggregateExistsInDatabase(
        queryRunner,
        aggregateId,
      );

      if (!aggregateExists) {
        // 创建新的聚合记录
        await this.createAggregateRecord(
          queryRunner,
          aggregateId,
          expectedVersion,
        );
      } else {
        // 更新聚合版本
        await this.updateAggregateVersion(
          queryRunner,
          aggregateId,
          expectedVersion,
        );
      }

      // 保存每个事件
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const eventVersion = expectedVersion + i + 1;

        await this.saveEventRecord(queryRunner, {
          eventId: event.eventId,
          aggregateId: aggregateId,
          eventType: event.eventType,
          eventData: JSON.stringify(event.eventData),
          eventMetadata: JSON.stringify(event.eventMetadata || {}),
          version: eventVersion,
          occurredAt: event.occurredAt || new Date(),
          tenantId: event.tenantId,
          correlationId: event.correlationId,
          causationId: event.causationId,
        });
      }

      await queryRunner.commitTransaction();

      this.logger.debug("事件保存到数据库成功", {
        aggregateId,
        eventCount: events.length,
        expectedVersion,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("保存事件到数据库失败", error);
      throw new Error(`保存事件到数据库失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 从数据库获取事件
   */
  private async getEventsFromDatabase(
    aggregateId: string,
    fromVersion?: number,
  ): Promise<any[]> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      let query = `
        SELECT event_id, aggregate_id, event_type, event_data, event_metadata,
               version, occurred_at, tenant_id, correlation_id, causation_id
        FROM events 
        WHERE aggregate_id = $1
      `;

      const values = [aggregateId];

      if (fromVersion !== undefined) {
        query += ` AND version >= $2`;
        values.push(fromVersion);
      }

      query += ` ORDER BY version ASC`;

      const result = await queryRunner.query(query, values);

      // 将数据库结果转换为事件对象
      const events = result.map((row) => ({
        eventId: row.event_id,
        aggregateId: row.aggregate_id,
        eventType: row.event_type,
        eventData: JSON.parse(row.event_data),
        eventMetadata: JSON.parse(row.event_metadata),
        version: row.version,
        occurredAt: row.occurred_at,
        tenantId: row.tenant_id,
        correlationId: row.correlation_id,
        causationId: row.causation_id,
      }));

      this.logger.debug("从数据库获取事件成功", {
        aggregateId,
        fromVersion,
        eventCount: events.length,
      });

      return events;
    } catch (error) {
      this.logger.error("从数据库获取事件失败", error);
      throw new Error(`从数据库获取事件失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 按类型从数据库获取事件
   */
  private async getEventsFromDatabaseByType(
    eventType: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<any[]> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      let query = `
        SELECT event_id, aggregate_id, event_type, event_data, event_metadata,
               version, occurred_at, tenant_id, correlation_id, causation_id
        FROM events 
        WHERE event_type = $1
      `;

      const values = [eventType];

      if (fromDate) {
        query += ` AND occurred_at >= $${values.length + 1}`;
        values.push(fromDate);
      }

      if (toDate) {
        query += ` AND occurred_at <= $${values.length + 1}`;
        values.push(toDate);
      }

      query += ` ORDER BY occurred_at ASC`;

      const result = await queryRunner.query(query, values);

      // 将数据库结果转换为事件对象
      const events = result.map((row) => ({
        eventId: row.event_id,
        aggregateId: row.aggregate_id,
        eventType: row.event_type,
        eventData: JSON.parse(row.event_data),
        eventMetadata: JSON.parse(row.event_metadata),
        version: row.version,
        occurredAt: row.occurred_at,
        tenantId: row.tenant_id,
        correlationId: row.correlation_id,
        causationId: row.causation_id,
      }));

      this.logger.debug("按类型从数据库获取事件成功", {
        eventType,
        fromDate,
        toDate,
        eventCount: events.length,
      });

      return events;
    } catch (error) {
      this.logger.error("按类型从数据库获取事件失败", error);
      throw new Error(`按类型从数据库获取事件失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 按租户从数据库获取事件
   */
  private async getEventsFromDatabaseByTenant(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<any[]> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      let query = `
        SELECT event_id, aggregate_id, event_type, event_data, event_metadata,
               version, occurred_at, tenant_id, correlation_id, causation_id
        FROM events 
        WHERE tenant_id = $1
      `;

      const values = [tenantId];

      if (fromDate) {
        query += ` AND occurred_at >= $${values.length + 1}`;
        values.push(fromDate);
      }

      if (toDate) {
        query += ` AND occurred_at <= $${values.length + 1}`;
        values.push(toDate);
      }

      query += ` ORDER BY occurred_at ASC`;

      const result = await queryRunner.query(query, values);

      // 将数据库结果转换为事件对象
      const events = result.map((row) => ({
        eventId: row.event_id,
        aggregateId: row.aggregate_id,
        eventType: row.event_type,
        eventData: JSON.parse(row.event_data),
        eventMetadata: JSON.parse(row.event_metadata),
        version: row.version,
        occurredAt: row.occurred_at,
        tenantId: row.tenant_id,
        correlationId: row.correlation_id,
        causationId: row.causation_id,
      }));

      this.logger.debug("按租户从数据库获取事件成功", {
        tenantId,
        fromDate,
        toDate,
        eventCount: events.length,
      });

      return events;
    } catch (error) {
      this.logger.error("按租户从数据库获取事件失败", error);
      throw new Error(`按租户从数据库获取事件失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 从数据库获取聚合版本
   */
  private async getAggregateVersionFromDatabase(
    aggregateId: string,
  ): Promise<number> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      const query = `
        SELECT version 
        FROM aggregates 
        WHERE aggregate_id = $1
      `;

      const result = await queryRunner.query(query, [aggregateId]);

      if (result.length === 0) {
        return 0; // 聚合不存在，版本为0
      }

      const version = result[0].version;

      this.logger.debug("从数据库获取聚合版本成功", {
        aggregateId,
        version,
      });

      return version;
    } catch (error) {
      this.logger.error("从数据库获取聚合版本失败", error);
      throw new Error(`从数据库获取聚合版本失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查聚合是否存在
   */
  private async checkAggregateExists(aggregateId: string): Promise<boolean> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      const query = `
        SELECT COUNT(*) as count 
        FROM aggregates 
        WHERE aggregate_id = $1
      `;

      const result = await queryRunner.query(query, [aggregateId]);
      const exists = parseInt(result[0].count) > 0;

      this.logger.debug("检查聚合是否存在", {
        aggregateId,
        exists,
      });

      return exists;
    } catch (error) {
      this.logger.error("检查聚合是否存在失败", error);
      throw new Error(`检查聚合是否存在失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 从数据库删除事件
   */
  private async deleteEventsFromDatabase(aggregateId: string): Promise<void> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 删除聚合的所有事件
      const deleteEventsQuery = `DELETE FROM events WHERE aggregate_id = $1`;
      await queryRunner.query(deleteEventsQuery, [aggregateId]);

      // 删除聚合记录
      const deleteAggregateQuery = `DELETE FROM aggregates WHERE aggregate_id = $1`;
      await queryRunner.query(deleteAggregateQuery, [aggregateId]);

      await queryRunner.commitTransaction();

      this.logger.debug("从数据库删除事件成功", {
        aggregateId,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("从数据库删除事件失败", error);
      throw new Error(`从数据库删除事件失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取缓存的事件
   */
  private async getCachedEvents(aggregateId: string): Promise<any[] | null> {
    try {
      const cacheKey = `events:${aggregateId}`;
      const cached = await this.cacheService.get(cacheKey, "event-store");
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      this.logger.warn("获取缓存事件失败");
      return null;
    }
  }

  /**
   * 缓存事件
   */
  private async cacheEvents(aggregateId: string, events: any[]): Promise<void> {
    try {
      const cacheKey = `events:${aggregateId}`;
      const ttl = this.config.retentionPeriod || 3600; // 默认1小时
      await this.cacheService.set(cacheKey, JSON.stringify(events), ttl);
    } catch (error) {
      this.logger.warn("缓存事件失败");
    }
  }

  /**
   * 使缓存失效
   */
  private async invalidateCache(aggregateId: string): Promise<void> {
    try {
      const cacheKey = `events:${aggregateId}`;
      await this.cacheService.del(cacheKey, "event-store");
    } catch (error) {
      this.logger.warn("使缓存失效失败");
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(events: any[]): void {
    this.stats.totalEvents += events.length;

    for (const event of events) {
      // 更新事件类型统计
      const eventType = event.eventType;
      this.stats.eventsByType[eventType] =
        (this.stats.eventsByType[eventType] || 0) + 1;

      // 更新租户统计
      const tenantId = event.tenantId;
      this.stats.eventsByTenant[tenantId] =
        (this.stats.eventsByTenant[tenantId] || 0) + 1;

      // 更新时间统计
      if (event.occurredAt < this.stats.oldestEvent) {
        this.stats.oldestEvent = event.occurredAt;
      }
      if (event.occurredAt > this.stats.newestEvent) {
        this.stats.newestEvent = event.occurredAt;
      }
    }
  }

  /**
   * 计算统计信息
   */
  private async calculateStats(): Promise<EventStoreStats> {
    const connection = await this.databaseService.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();

      // 获取总事件数
      const totalEventsResult = await queryRunner.query(
        `SELECT COUNT(*) as count FROM events`,
      );
      const totalEvents = parseInt(totalEventsResult[0].count);

      // 获取总聚合数
      const totalAggregatesResult = await queryRunner.query(
        `SELECT COUNT(*) as count FROM aggregates`,
      );
      const totalAggregates = parseInt(totalAggregatesResult[0].count);

      // 获取事件类型统计
      const eventsByTypeResult = await queryRunner.query(`
        SELECT event_type, COUNT(*) as count 
        FROM events 
        GROUP BY event_type
      `);
      const eventsByType: Record<string, number> = {};
      for (const row of eventsByTypeResult) {
        eventsByType[row.event_type] = parseInt(row.count);
      }

      // 获取租户统计
      const eventsByTenantResult = await queryRunner.query(`
        SELECT tenant_id, COUNT(*) as count 
        FROM events 
        GROUP BY tenant_id
      `);
      const eventsByTenant: Record<string, number> = {};
      for (const row of eventsByTenantResult) {
        eventsByTenant[row.tenant_id] = parseInt(row.count);
      }

      // 获取时间范围
      const timeRangeResult = await queryRunner.query(`
        SELECT MIN(occurred_at) as oldest, MAX(occurred_at) as newest 
        FROM events
      `);

      const stats: EventStoreStats = {
        totalEvents,
        totalAggregates,
        eventsByType,
        eventsByTenant,
        averageEventsPerAggregate:
          totalAggregates > 0 ? totalEvents / totalAggregates : 0,
        oldestEvent: timeRangeResult[0]?.oldest || new Date(),
        newestEvent: timeRangeResult[0]?.newest || new Date(),
      };

      this.logger.debug("计算统计信息成功", stats);
      return stats;
    } catch (error) {
      this.logger.error("计算统计信息失败", error);
      return this.stats; // 返回缓存的统计信息
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 检查聚合是否存在于数据库中
   *
   * @private
   */
  private async checkAggregateExistsInDatabase(
    queryRunner: any,
    aggregateId: string,
  ): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM aggregates WHERE aggregate_id = $1`;
      const result = await queryRunner.query(query, [aggregateId]);
      return parseInt(result[0].count) > 0;
    } catch (error) {
      this.logger.error("检查聚合是否存在于数据库中失败", error);
      return false;
    }
  }

  /**
   * 创建聚合记录
   *
   * @private
   */
  private async createAggregateRecord(
    queryRunner: any,
    aggregateId: string,
    version: number,
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO aggregates (aggregate_id, version, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
      `;
      await queryRunner.query(query, [aggregateId, version]);
    } catch (error) {
      this.logger.error("创建聚合记录失败", error);
      throw new Error(`创建聚合记录失败: ${error.message}`);
    }
  }

  /**
   * 更新聚合版本
   *
   * @private
   */
  private async updateAggregateVersion(
    queryRunner: any,
    aggregateId: string,
    newVersion: number,
  ): Promise<void> {
    try {
      const query = `
        UPDATE aggregates 
        SET version = $1, updated_at = NOW()
        WHERE aggregate_id = $2
      `;
      await queryRunner.query(query, [newVersion, aggregateId]);
    } catch (error) {
      this.logger.error("更新聚合版本失败", error);
      throw new Error(`更新聚合版本失败: ${error.message}`);
    }
  }

  /**
   * 保存事件记录
   *
   * @private
   */
  private async saveEventRecord(
    queryRunner: any,
    eventData: {
      eventId: string;
      aggregateId: string;
      eventType: string;
      eventData: string;
      eventMetadata: string;
      version: number;
      occurredAt: Date;
      tenantId?: string;
      correlationId?: string;
      causationId?: string;
    },
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO events (
          event_id, aggregate_id, event_type, event_data, event_metadata,
          version, occurred_at, tenant_id, correlation_id, causation_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      const values = [
        eventData.eventId,
        eventData.aggregateId,
        eventData.eventType,
        eventData.eventData,
        eventData.eventMetadata,
        eventData.version,
        eventData.occurredAt,
        eventData.tenantId || null,
        eventData.correlationId || null,
        eventData.causationId || null,
      ];

      await queryRunner.query(query, values);
    } catch (error) {
      this.logger.error("保存事件记录失败", error);
      throw new Error(`保存事件记录失败: ${error.message}`);
    }
  }
}
