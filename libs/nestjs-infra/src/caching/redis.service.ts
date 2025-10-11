/**
 * Redis 服务
 *
 * @description 提供 Redis 连接和基础操作
 *
 * @since 0.2.0
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { GeneralInternalServerException } from '../exceptions/core/general-internal-server.exception.js';

/**
 * Redis 连接选项
 */
export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  connectTimeout?: number;
  retryStrategy?: (times: number) => number | void;
}

/**
 * Redis 服务
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;

  constructor(private readonly options: RedisOptions) {}

  /**
   * 模块初始化时连接 Redis
   */
  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * 模块销毁时断开连接
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * 连接 Redis
   */
  async connect(): Promise<void> {
    try {
      this.client = new Redis({
        host: this.options.host,
        port: this.options.port,
        password: this.options.password,
        db: this.options.db || 0,
        connectTimeout: this.options.connectTimeout || 10000,
        retryStrategy: this.options.retryStrategy || ((times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }),
      });

      // 监听连接事件
      this.client!.on('connect', () => {
        console.log('Redis 连接成功');
      });

      this.client!.on('error', (error: Error) => {
        console.error('Redis 连接错误:', error);
      });

      // 等待连接建立
      await this.client!.ping();
    } catch (error) {
      throw new GeneralInternalServerException(
        'Redis 连接失败',
        '无法连接到 Redis 服务器',
        { host: this.options.host, port: this.options.port },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 断开 Redis 连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * 获取 Redis 客户端
   *
   * @returns Redis 客户端实例
   * @throws {GeneralInternalServerException} Redis 未连接
   */
  getClient(): Redis {
    if (!this.client) {
      throw new GeneralInternalServerException(
        'Redis 未连接',
        'Redis 客户端尚未初始化',
      );
    }
    return this.client;
  }

  /**
   * 健康检查
   *
   * @returns 连接状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}

