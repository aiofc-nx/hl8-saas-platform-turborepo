/**
 * Redis 服务
 *
 * @description 管理 Redis 连接和生命周期
 *
 * ## 业务规则
 *
 * ### 连接管理
 * - 模块初始化时自动连接
 * - 模块销毁时自动断开
 * - 连接失败时重试（exponential backoff）
 *
 * ### 健康检查
 * - PING 命令检测可用性
 * - 记录连接状态到日志
 *
 * ### 错误处理
 * - 连接错误记录到日志
 * - 重试策略：1秒、2秒、4秒...最多 10 次
 *
 * @since 1.0.0
 */

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisConnectionException } from '../exceptions/redis-connection.exception.js';
import type { RedisOptions } from '../types/redis-options.interface.js';

export const REDIS_OPTIONS = 'REDIS_OPTIONS';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(
    @Inject(REDIS_OPTIONS)
    private readonly options: RedisOptions,
  ) {}

  /**
   * 模块初始化钩子
   *
   * @description 自动连接 Redis
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * 模块销毁钩子
   *
   * @description 自动断开 Redis 连接
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * 连接 Redis
   *
   * @throws 如果连接失败
   */
  async connect(): Promise<void> {
    if (this.client) {
      this.logger.warn('Redis 已连接，跳过重复连接');
      return;
    }

    try {
      this.logger.log(
        `正在连接 Redis: ${this.options.host}:${this.options.port}`,
      );

      this.client = new Redis({
        ...this.options,
        retryStrategy:
          this.options.retryStrategy ?? this.defaultRetryStrategy.bind(this),
      });

      // 监听连接事件
      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis 连接成功');
      });

      this.client.on('error', (error: Error) => {
        this.logger.error(`Redis 错误: ${error.message}`, error.stack);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis 连接已关闭');
      });

      // 等待连接就绪
      await this.client.ping();
    } catch (error) {
      this.logger.error('Redis 连接失败', undefined, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * 断开 Redis 连接
   */
  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      this.logger.log('Redis 连接已断开');
    } catch (error) {
      this.logger.error('Redis 断开连接失败', undefined, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // 强制关闭
      if (this.client) {
        this.client.disconnect();
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * 获取 Redis 客户端
   *
   * @returns Redis 客户端实例
   * @throws RedisConnectionException 如果未连接
   */
  getClient(): Redis {
    if (!this.client) {
      this.logger.error('Redis 未连接，尝试获取客户端', undefined, {
        connectionState: this.isConnected,
        clientExists: !!this.client,
      });
      throw new RedisConnectionException(
        'Redis 未连接，请确保模块已正确初始化',
      );
    }

    return this.client;
  }

  /**
   * 健康检查
   *
   * @returns true 如果 Redis 可用
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis 健康检查失败', undefined, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }

  /**
   * 获取连接状态
   *
   * @returns true 如果已连接
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * 默认重试策略
   *
   * @description Exponential backoff：1s, 2s, 4s, 8s...最多 10 次
   *
   * @param times - 当前重试次数
   * @returns 重试延迟（毫秒）或 null（停止重试）
   * @private
   */
  private defaultRetryStrategy(times: number): number | null {
    if (times > 10) {
      this.logger.error('Redis 重试次数超过限制，停止重试');
      return null;
    }

    const delay = Math.min(times * 1000, 10000); // 最多 10 秒
    this.logger.warn(`Redis 重试第 ${times} 次，延迟 ${delay}ms`);

    return delay;
  }
}
