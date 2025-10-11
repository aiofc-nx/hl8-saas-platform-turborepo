/**
 * 文件配置加载器
 *
 * @description 加载 YAML 和 JSON 配置文件
 *
 * @since 0.3.0
 */

import { readFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { ConfigLoader } from '../typed-config.module';

/**
 * 文件加载器选项
 */
export interface FileLoaderOptions {
  /** 文件路径 */
  path: string;
}

/**
 * 文件加载器
 */
export class FileLoader implements ConfigLoader {
  constructor(private readonly options: FileLoaderOptions) {}

  /**
   * 加载配置文件
   *
   * @returns 配置对象
   */
  load(): any {
    const content = readFileSync(this.options.path, 'utf-8');
    
    if (this.options.path.endsWith('.yml') || this.options.path.endsWith('.yaml')) {
      return loadYaml(content);
    }
    
    if (this.options.path.endsWith('.json')) {
      return JSON.parse(content);
    }
    
    throw new Error(`Unsupported file type: ${this.options.path}`);
  }
}

/**
 * 创建文件加载器
 *
 * @param options - 文件加载器选项
 * @returns 文件加载器实例
 */
export function fileLoader(options: FileLoaderOptions): FileLoader {
  return new FileLoader(options);
}

