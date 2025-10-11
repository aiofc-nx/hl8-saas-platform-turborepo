/**
 * 远程配置加载器
 *
 * @description 从远程服务器加载配置（可选功能）
 *
 * ## 功能特性
 *
 * ### 缓存支持
 * - 支持可选的 Redis 缓存
 * - 缓存远程配置，减少网络请求
 * - 跨服务实例共享缓存
 *
 * ### 缓存策略
 * - 优先从缓存读取
 * - 缓存未命中时从远程加载
 * - 支持自定义 TTL
 *
 * @since 0.3.0
 */

import { ConfigLoader } from '../typed-config.module.js';
import { GeneralInternalServerException } from '../../exceptions/core/general-internal-server.exception.js';
import type { CacheService } from '../../caching/cache.service.js';

/**
 * 远程加载器选项
 */
export interface RemoteLoaderOptions {
  /** 远程 URL */
  url: string;
  /** 请求超时（毫秒） */
  timeout?: number;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 缓存服务（可选，用于缓存远程配置） */
  cacheService?: CacheService;
  /** 缓存 TTL（秒，默认 300） */
  cacheTTL?: number;
}

/**
 * 远程加载器
 *
 * @description 从远程服务器获取配置，支持 Redis 缓存
 *
 * ## 使用示例
 *
 * ### 不使用缓存
 * ```typescript
 * const loader = remoteLoader({
 *   url: 'https://config.example.com/app.json'
 * });
 * ```
 *
 * ### 使用缓存
 * ```typescript
 * const loader = remoteLoader({
 *   url: 'https://config.example.com/app.json',
 *   cacheService: cacheService,    // 注入 CacheService
 *   cacheTTL: 600,                  // 缓存 10 分钟
 * });
 * ```
 */
export class RemoteLoader implements ConfigLoader {
  private readonly cacheKey: string;

  constructor(private readonly options: RemoteLoaderOptions) {
    // 生成缓存键
    this.cacheKey = `config:remote:${this.hashUrl(options.url)}`;
  }

  /**
   * 加载远程配置
   *
   * @returns 配置对象
   *
   * @description
   * 1. 如果启用缓存，先尝试从缓存读取
   * 2. 缓存未命中时，从远程服务器加载
   * 3. 将加载的配置写入缓存
   */
  async load(): Promise<any> {
    // 1. 尝试从缓存读取
    if (this.options.cacheService) {
      const cached = await this.loadFromCache();
      if (cached) {
        return cached;
      }
    }

    // 2. 从远程加载
    const config = await this.loadFromRemote();

    // 3. 写入缓存
    if (this.options.cacheService && config) {
      await this.saveToCache(config);
    }

    return config;
  }

  /**
   * 从缓存加载配置
   *
   * @returns 配置对象，缓存未命中返回 null
   * @private
   */
  private async loadFromCache(): Promise<any> {
    try {
      return await this.options.cacheService!.get<any>(this.cacheKey);
    } catch (error) {
      // 缓存读取失败，静默处理，继续从远程加载
      return null;
    }
  }

  /**
   * 保存配置到缓存
   *
   * @param config - 配置对象
   * @private
   */
  private async saveToCache(config: any): Promise<void> {
    try {
      await this.options.cacheService!.set(
        this.cacheKey,
        config,
        this.options.cacheTTL || 300, // 默认 5 分钟
      );
    } catch (error) {
      // 缓存写入失败，静默处理，不影响配置加载
    }
  }

  /**
   * 从远程服务器加载配置
   *
   * @returns 配置对象
   * @private
   */
  private async loadFromRemote(): Promise<any> {
    try {
      const response = await fetch(this.options.url, {
        headers: this.options.headers,
        signal: AbortSignal.timeout(this.options.timeout || 5000),
      });

      if (!response.ok) {
        throw new GeneralInternalServerException(
          '远程配置请求失败',
          `HTTP ${response.status}: ${response.statusText}`,
          { url: this.options.url, status: response.status },
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof GeneralInternalServerException) {
        throw error;
      }
      throw new GeneralInternalServerException(
        '远程配置加载失败',
        `无法从远程服务器加载配置`,
        { url: this.options.url },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 生成 URL 的哈希值（用于缓存键）
   *
   * @param url - URL 字符串
   * @returns 哈希字符串
   * @private
   */
  private hashUrl(url: string): string {
    // 简单的哈希实现，生产环境可以使用 crypto
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * 创建远程加载器
 *
 * @param options - 远程加载器选项
 * @returns 远程加载器实例
 */
export function remoteLoader(options: RemoteLoaderOptions): RemoteLoader {
  return new RemoteLoader(options);
}

