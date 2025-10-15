/**
 * 日志适配器
 *
 * @description 用于连接不同层的日志实现
 * 提供统一的日志接口，支持多种底层日志实现
 *
 * ## 业务规则
 *
 * ### 适配器模式规则
 * - 统一不同日志实现的接口
 * - 支持运行时切换日志实现
 * - 保持日志上下文的一致性
 *
 * ### 性能优化规则
 * - 最小化适配器开销
 * - 支持日志级别缓存
 * - 避免不必要的对象创建
 *
 * @since 1.0.0
 */

import type { IPureLogger, LogContext, LogLevel } from '../interfaces/pure-logger.interface.js';

/**
 * 日志适配器接口
 */
export interface ILoggerAdapter {
  /**
   * 适配器名称
   */
  readonly name: string;

  /**
   * 适配器版本
   */
  readonly version: string;

  /**
   * 创建日志器实例
   *
   * @param level - 日志级别
   * @param context - 默认上下文
   * @returns 日志器实例
   */
  createLogger(level: LogLevel, context?: LogContext): IPureLogger;

  /**
   * 检查适配器是否可用
   *
   * @returns 是否可用
   */
  isAvailable(): boolean;

  /**
   * 获取适配器信息
   *
   * @returns 适配器信息
   */
  getInfo(): { name: string; version: string; available: boolean };
}

/**
 * 日志适配器基类
 */
export abstract class BaseLoggerAdapter implements ILoggerAdapter {
  abstract readonly name: string;
  abstract readonly version: string;

  /**
   * 创建日志器实例
   */
  abstract createLogger(level: LogLevel, context?: LogContext): IPureLogger;

  /**
   * 检查适配器是否可用
   */
  abstract isAvailable(): boolean;

  /**
   * 获取适配器信息
   */
  getInfo(): { name: string; version: string; available: boolean } {
    return {
      name: this.name,
      version: this.version,
      available: this.isAvailable(),
    };
  }
}

/**
 * 日志适配器管理器
 */
export class LoggerAdapterManager {
  private adapters: Map<string, ILoggerAdapter> = new Map();
  private defaultAdapter?: string;

  /**
   * 注册日志适配器
   *
   * @param name - 适配器名称
   * @param adapter - 适配器实例
   * @param isDefault - 是否为默认适配器
   */
  register(name: string, adapter: ILoggerAdapter, isDefault = false): void {
    this.adapters.set(name, adapter);
    
    if (isDefault || !this.defaultAdapter) {
      this.defaultAdapter = name;
    }
  }

  /**
   * 获取日志适配器
   *
   * @param name - 适配器名称
   * @returns 适配器实例
   */
  getAdapter(name?: string): ILoggerAdapter | undefined {
    const adapterName = name || this.defaultAdapter;
    if (!adapterName) {
      return undefined;
    }

    const adapter = this.adapters.get(adapterName);
    if (adapter && adapter.isAvailable()) {
      return adapter;
    }

    return undefined;
  }

  /**
   * 获取所有可用适配器
   *
   * @returns 可用适配器列表
   */
  getAvailableAdapters(): ILoggerAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
  }

  /**
   * 获取所有适配器信息
   *
   * @returns 适配器信息列表
   */
  getAdapterInfos(): Array<{ name: string; version: string; available: boolean }> {
    return Array.from(this.adapters.values()).map(adapter => adapter.getInfo());
  }

  /**
   * 设置默认适配器
   *
   * @param name - 适配器名称
   */
  setDefault(name: string): void {
    if (this.adapters.has(name)) {
      this.defaultAdapter = name;
    }
  }

  /**
   * 移除适配器
   *
   * @param name - 适配器名称
   */
  unregister(name: string): void {
    this.adapters.delete(name);
    
    if (this.defaultAdapter === name) {
      const availableAdapters = this.getAvailableAdapters();
      this.defaultAdapter = availableAdapters.length > 0 ? availableAdapters[0]?.name : undefined;
    }
  }

  /**
   * 清空所有适配器
   */
  clear(): void {
    this.adapters.clear();
    this.defaultAdapter = undefined;
  }
}

/**
 * 全局日志适配器管理器实例
 */
export const loggerAdapterManager = new LoggerAdapterManager();
