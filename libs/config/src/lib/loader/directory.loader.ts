/**
 * 目录加载器
 *
 * @description 从目录加载配置文件的加载器
 * @author HL8 SAAS Platform Team
 * @since 1.0.0
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { ConfigLoader } from '../interfaces/typed-config-module-options.interface.js';

/**
 * 目录加载器选项接口
 *
 * @description 定义目录加载器的选项
 * @interface DirectoryLoaderOptions
 * @since 1.0.0
 */
export interface DirectoryLoaderOptions {
  /**
   * 配置目录路径
   * @description 包含配置文件的目录路径
   */
  directory: string;

  /**
   * 文件包含正则表达式
   * @description 包含哪些文件的正则表达式
   * @default /\.(json|yml|yaml)$/
   */
  include?: RegExp;

  /**
   * 是否忽略环境变量替换
   * @description 是否忽略环境变量替换
   * @default false
   */
  ignoreEnvironmentVariableSubstitution?: boolean;

  /**
   * 是否禁止未定义的环境变量
   * @description 是否禁止未定义的环境变量
   * @default true
   */
  disallowUndefinedEnvironmentVariables?: boolean;
}

/**
 * 目录加载器
 *
 * @description 从目录加载配置文件的加载器
 * @param options 目录加载器选项
 * @returns 配置加载器函数
 * @example
 * ```typescript
 * const loader = directoryLoader({
 *   directory: './config',
 *   include: /\.(json|yml)$/,
 *   ignoreEnvironmentVariableSubstitution: false
 * });
 * ```
 * @author HL8 SAAS Platform Team
 * @since 1.0.0
 */
export const directoryLoader = (
  options: DirectoryLoaderOptions,
): ConfigLoader => {
  const {
    directory,
    include = /\.(json|yml|yaml)$/,
    ignoreEnvironmentVariableSubstitution = false,
    disallowUndefinedEnvironmentVariables = true,
  } = options;

  return (): Record<string, any> => {
    if (!fs.existsSync(directory)) {
      throw new Error(`Configuration directory not found: ${directory}`);
    }

    const config: Record<string, any> = {};
    const files = fs.readdirSync(directory);

    for (const file of files) {
      if (include.test(file)) {
        const filePath = path.join(directory, file);
        const basename = path.basename(file, path.extname(file));
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(file).toLowerCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON/YAML 解析结果类型未知（宪章 IX 允许场景：第三方库集成）
        let fileConfig: any;

        switch (ext) {
          case '.json':
            fileConfig = JSON.parse(content);
            break;
          case '.yml':
          case '.yaml':
            fileConfig = yaml.load(content);
            break;
          default:
            continue;
        }

        if (!ignoreEnvironmentVariableSubstitution) {
          fileConfig = substituteEnvironmentVariables(
            fileConfig,
            disallowUndefinedEnvironmentVariables,
          );
        }

        config[basename] = fileConfig;
      }
    }

    return config;
  };
};

/**
 * 替换环境变量
 *
 * @description 在配置对象中替换环境变量
 * @param config 配置对象
 * @param disallowUndefined 是否禁止未定义的环境变量
 * @returns 替换后的配置对象
 * @author HL8 SAAS Platform Team
 * @since 1.0.0
 *
 * @remarks
 * 使用 any 符合宪章 IX 允许场景：配置对象结构未知，可以是任意类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 配置对象结构未知（宪章 IX 允许场景：通用工具）
function substituteEnvironmentVariables(
  config: any,
  disallowUndefined: boolean = true,
): any {
  if (typeof config === 'string') {
    return config.replace(/\$\{([^}]+)\}/g, (match, key) => {
      const value = process.env[key];
      if (value === undefined && disallowUndefined) {
        throw new Error(`Environment variable ${key} is not defined`);
      }
      return value !== undefined ? value : match;
    });
  }

  if (Array.isArray(config)) {
    return config.map((item) =>
      substituteEnvironmentVariables(item, disallowUndefined),
    );
  }

  if (config && typeof config === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 结果对象结构与输入相同，使用 any 保持灵活性（宪章 IX 允许场景）
    const result: any = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = substituteEnvironmentVariables(value, disallowUndefined);
    }
    return result;
  }

  return config;
}
