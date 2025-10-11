/**
 * 远程配置加载器
 *
 * @description 从远程服务器加载配置（可选功能）
 *
 * @since 0.3.0
 */

import { ConfigLoader } from '../typed-config.module.js';
import { GeneralInternalServerException } from '../../exceptions/core/general-internal-server.exception.js';

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
}

/**
 * 远程加载器
 *
 * @description 从远程服务器获取配置（简化实现）
 */
export class RemoteLoader implements ConfigLoader {
  constructor(private readonly options: RemoteLoaderOptions) {}

  /**
   * 加载远程配置
   *
   * @returns 配置对象
   */
  async load(): Promise<any> {
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

