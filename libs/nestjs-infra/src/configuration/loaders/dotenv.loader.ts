/**
 * Dotenv 配置加载器
 *
 * @description 加载 .env 文件和环境变量
 *
 * @since 0.3.0
 */

import { config } from 'dotenv';
import { ConfigLoader } from '../typed-config.module';

/**
 * Dotenv 加载器选项
 */
export interface DotenvLoaderOptions {
  /** .env 文件路径 */
  path?: string;
  /** 分隔符（用于嵌套配置） */
  separator?: string;
}

/**
 * Dotenv 加载器
 */
export class DotenvLoader implements ConfigLoader {
  constructor(private readonly options: DotenvLoaderOptions = {}) {}

  /**
   * 加载环境变量
   *
   * @returns 配置对象
   */
  load(): any {
    if (this.options.path) {
      config({ path: this.options.path });
    }

    return process.env;
  }
}

/**
 * 创建 Dotenv 加载器
 *
 * @param options - Dotenv 加载器选项
 * @returns Dotenv 加载器实例
 */
export function dotenvLoader(options: DotenvLoaderOptions = {}): DotenvLoader {
  return new DotenvLoader(options);
}

