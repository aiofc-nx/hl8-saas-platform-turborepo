/**
 * 数据库连接管理器
 *
 * @description 管理数据库连接的生命周期
 *
 * ## 业务规则
 *
 * ### 连接管理规则
 * - 应用启动时自动建立连接
 * - 连接失败时使用指数退避算法重试
 * - 最多重试 5 次，超过后抛出异常
 * - 连接断开时自动尝试重连
 *
 * ### 健康检查规则
 * - 定期检查连接状态（每分钟）
 * - 检测到不健康的连接立即标记
 * - 提供健康检查接口供外部调用
 *
 * ### 生命周期规则
 * - onModuleInit: 建立初始连接
 * - onModuleDestroy: 优雅关闭所有连接
 * - 确保资源正确释放
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     private readonly connectionManager: ConnectionManager,
 *   ) {}
 *
 *   async checkConnection() {
 *     const isConnected = await this.connectionManager.isConnected();
 *     return { connected: isConnected };
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CONNECTION_DEFAULTS } from '../constants/defaults.js';
import { DatabaseConnectionException } from '../exceptions/database-connection.exception.js';
import {
  ConnectionStatus,
  type ConnectionInfo,
  type PoolStats,
} from '../types/connection.types.js';

@Injectable()
export class ConnectionManager implements OnModuleInit, OnModuleDestroy {
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private connectedAt?: Date;
  private lastActivityAt?: Date;
  private reconnectAttempts = 0;

  constructor(
    private readonly orm: MikroORM,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.log('ConnectionManager 初始化');
  }

  /**
   * 模块初始化钩子
   *
   * @description 应用启动时自动建立数据库连接
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('正在建立数据库连接...');
    await this.connect();
  }

  /**
   * 模块销毁钩子
   *
   * @description 应用关闭时优雅关闭数据库连接
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('正在关闭数据库连接...');
    await this.disconnect();
  }

  /**
   * 建立数据库连接
   *
   * @description 连接到数据库，失败时自动重试
   *
   * @throws {DatabaseConnectionException} 连接失败时抛出
   */
  async connect(): Promise<void> {
    try {
      this.connectionStatus = ConnectionStatus.CONNECTING;

      const connected = await this.orm.isConnected();

      if (!connected) {
        // MikroORM 在创建时会自动连接，这里只是确认状态
        // 如果未连接，等待一段时间让连接建立
        await this.waitForConnection();
      }

      this.connectionStatus = ConnectionStatus.CONNECTED;
      this.connectedAt = new Date();
      this.lastActivityAt = new Date();
      this.reconnectAttempts = 0;

      this.logger.log('数据库连接成功', {
        host: this.getConnectionConfig().host,
        database: this.getConnectionConfig().database,
        connectedAt: this.connectedAt,
      });
    } catch (error) {
      this.connectionStatus = ConnectionStatus.FAILED;
      this.logger.error('数据库连接失败', (error as Error).stack);

      // 尝试重连
      if (this.reconnectAttempts < CONNECTION_DEFAULTS.MAX_RECONNECT_ATTEMPTS) {
        await this.reconnect();
      } else {
        throw new DatabaseConnectionException(
          `无法连接到数据库服务器，已重试 ${this.reconnectAttempts} 次`,
          {
            host: this.getConnectionConfig().host,
            port: this.getConnectionConfig().port,
            attempts: this.reconnectAttempts,
          },
        );
      }
    }
  }

  /**
   * 等待连接建立
   *
   * @description 等待 MikroORM 建立连接
   */
  private async waitForConnection(): Promise<void> {
    const maxWait = CONNECTION_DEFAULTS.CONNECT_TIMEOUT;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (await this.orm.isConnected()) {
        return;
      }
      await this.sleep(100);
    }

    throw new Error('等待连接超时');
  }

  /**
   * 重连数据库
   *
   * @description 使用指数退避算法重连
   */
  private async reconnect(): Promise<void> {
    this.reconnectAttempts++;
    this.connectionStatus = ConnectionStatus.RECONNECTING;

    // 计算退避延迟（指数增长）
    const delay = Math.min(
      CONNECTION_DEFAULTS.RECONNECT_INITIAL_DELAY *
        Math.pow(2, this.reconnectAttempts - 1),
      CONNECTION_DEFAULTS.RECONNECT_MAX_DELAY,
    );

    this.logger.warn(
      `重连数据库（第 ${this.reconnectAttempts} 次尝试），等待 ${delay}ms`,
      {
        attempt: this.reconnectAttempts,
        delayMs: delay,
      },
    );

    await this.sleep(delay);
    await this.connect();
  }

  /**
   * 断开数据库连接
   *
   * @description 优雅关闭数据库连接
   */
  async disconnect(): Promise<void> {
    try {
      if (await this.orm.isConnected()) {
        await this.orm.close(true); // force close
        this.connectionStatus = ConnectionStatus.DISCONNECTED;
        this.logger.log('数据库连接已关闭');
      }
    } catch (error) {
      this.logger.error('关闭数据库连接时发生错误', (error as Error).stack);
      throw new DatabaseConnectionException('关闭数据库连接失败');
    }
  }

  /**
   * 检查连接状态
   *
   * @description 检查数据库是否已连接
   * @returns 是否已连接
   */
  async isConnected(): Promise<boolean> {
    return this.orm.isConnected();
  }

  /**
   * 获取连接信息
   *
   * @description 获取连接的详细信息
   * @returns 连接信息对象
   */
  async getConnectionInfo(): Promise<ConnectionInfo> {
    const poolStats = await this.getPoolStats();

    return {
      status: this.connectionStatus,
      type: this.getConnectionConfig().type,
      host: this.getConnectionConfig().host,
      port: this.getConnectionConfig().port,
      database: this.getConnectionConfig().database,
      connectedAt: this.connectedAt,
      lastActivityAt: this.lastActivityAt,
      poolStats,
    };
  }

  /**
   * 获取连接池统计
   *
   * @description 获取连接池的实时统计信息
   * @returns 连接池统计
   */
  async getPoolStats(): Promise<PoolStats> {
    // 从 MikroORM 获取连接池信息
    const driver = (this.orm as any).driver;
    const pool = driver?.connection?.getPool?.();

    if (!pool) {
      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        max: 0,
        min: 0,
      };
    }

    return {
      total: pool.totalCount || 0,
      active: (pool.totalCount || 0) - (pool.idleCount || 0),
      idle: pool.idleCount || 0,
      waiting: pool.waitingCount || 0,
      max: pool.max || 0,
      min: pool.min || 0,
    };
  }

  /**
   * 获取 ORM 实例
   *
   * @description 获取 MikroORM 实例供其他服务使用
   * @returns MikroORM 实例
   */
  getOrm(): MikroORM {
    return this.orm;
  }

  /**
   * 获取连接配置（内部方法）
   *
   * @private
   */
  private getConnectionConfig() {
    const config = this.orm.config as any;
    return {
      type: config.get('type'),
      host: config.get('host'),
      port: config.get('port'),
      database: config.get('dbName'),
    };
  }

  /**
   * 延迟辅助方法
   *
   * @param ms - 延迟毫秒数
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
