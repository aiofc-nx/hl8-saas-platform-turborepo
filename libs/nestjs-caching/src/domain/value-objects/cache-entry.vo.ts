/**
 * 缓存条目值对象
 * 
 * @description 封装缓存条目的验证和序列化逻辑
 * 
 * ## 业务规则
 * 
 * ### TTL 规则
 * - 最小值: 1 秒
 * - 最大值: 2,592,000 秒（30 天）
 * - 0 表示永不过期（慎用）
 * - 负数无效
 * 
 * ### 值大小规则
 * - 推荐最大: 1MB
 * - 警告阈值: 512KB
 * - 超过 1MB 会记录警告日志
 * 
 * ### 序列化规则
 * - 使用 JSON 序列化
 * - 处理循环引用
 * - 处理特殊类型（Date、Buffer、Set、Map）
 * 
 * @example
 * ```typescript
 * // 创建缓存条目
 * const key = CacheKey.forTenant('user', 'profile', 'hl8:cache:', { 
 *   tenantId: 't123' 
 * });
 * const value = { id: 'u999', name: '张三', email: 'zhangsan@example.com' };
 * const entry = CacheEntry.create(key, value, 3600, logger);
 * 
 * console.log(entry.getSize()); // 值的字节大小
 * console.log(entry.getTTL()); // 3600
 * 
 * // 检查过期状态
 * if (entry.isExpiringSoon()) {
 *   console.log('缓存即将过期，考虑刷新');
 * }
 * ```
 * 
 * @since 1.0.0
 */

import type { CacheKey } from './cache-key.vo.js';

/**
 * 日志服务接口（临时定义，后续会从 nestjs-infra 导入）
 * 
 * @remarks
 * context 参数使用 any 符合宪章 IX 允许场景：日志上下文可以是任意类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 日志上下文可以是任意类型（宪章 IX 允许场景）
interface ILoggerService {
  warn(message: string, context?: any): void;
  error(message: string, stack?: string, context?: any): void;
}

/**
 * 通用错误异常（临时定义）
 */
class GeneralBadRequestException extends Error {
  constructor(message: string, detail?: string, context?: Record<string, any>) {
    super(detail || message);
    this.name = 'GeneralBadRequestException';
  }
}

class GeneralInternalServerException extends Error {
  constructor(message: string, detail?: string, context?: Record<string, any>, cause?: Error) {
    super(detail || message);
    this.name = 'GeneralInternalServerException';
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * 缓存条目值对象
 * 
 * 值对象特性：
 * - 不可变（所有属性 readonly）
 * - 无副作用
 * - 自验证（构造时验证有效性）
 * - 封装业务规则
 */
export class CacheEntry<T = any> {
  private static readonly MAX_TTL = 2592000; // 30 天
  private static readonly WARN_SIZE = 512 * 1024; // 512KB
  private static readonly MAX_SIZE = 1 * 1024 * 1024; // 1MB
  
  private readonly serializedValue: string;
  private readonly size: number;
  
  /**
   * 私有构造函数 - 强制使用静态工厂方法创建实例
   * 
   * @param key - 缓存键（值对象）
   * @param value - 缓存值
   * @param ttl - 过期时间（秒）
   * @param createdAt - 创建时间
   */
  private constructor(
    private readonly key: CacheKey,
    private readonly value: T,
    private readonly ttl: number,
    private readonly createdAt: Date,
  ) {
    this.validateTTL();
    this.serializedValue = this.serialize();
    this.size = Buffer.byteLength(this.serializedValue, 'utf-8');
    this.validateSize();
  }
  
  /**
   * 创建缓存条目
   * 
   * @description 静态工厂方法，确保创建的对象始终有效
   * 
   * @param key - 缓存键（值对象）
   * @param value - 缓存值（任意可序列化类型）
   * @param ttl - 过期时间（秒），默认 3600（1小时）
   * @param logger - 日志服务（可选，用于记录警告）
   * @returns CacheEntry 实例
   * @throws {GeneralBadRequestException} TTL 或值大小无效
   * @throws {GeneralInternalServerException} 序列化失败
   * 
   * @example
   * ```typescript
   * const key = CacheKey.forTenant('user', 'profile', 'hl8:cache:', { 
   *   tenantId: 't123' 
   * });
   * const value = { id: 'u999', name: '张三' };
   * const entry = CacheEntry.create(key, value, 1800, logger);
   * ```
   */
  static create<T>(
    key: CacheKey,
    value: T,
    ttl: number = 3600,
    logger?: ILoggerService,
  ): CacheEntry<T> {
    const entry = new CacheEntry(key, value, ttl, new Date());
    
    // 记录警告（如果值过大）
    if (logger && entry.size > CacheEntry.WARN_SIZE) {
      logger.warn('缓存值较大', {
        key: key.toString(),
        size: entry.size,
        threshold: CacheEntry.WARN_SIZE,
      });
    }
    
    return entry;
  }
  
  /**
   * 验证 TTL 有效性
   * 
   * @throws {GeneralBadRequestException} TTL 无效
   * @private
   */
  private validateTTL(): void {
    if (this.ttl < 0) {
      throw new GeneralBadRequestException(
        'TTL 无效',
        'TTL 不能为负数',
        { ttl: this.ttl }
      );
    }
    
    if (this.ttl > CacheEntry.MAX_TTL) {
      throw new GeneralBadRequestException(
        'TTL 过大',
        `TTL 不能超过 ${CacheEntry.MAX_TTL} 秒（30 天）`,
        { ttl: this.ttl, max: CacheEntry.MAX_TTL }
      );
    }
  }
  
  /**
   * 序列化缓存值
   * 
   * @returns 序列化后的 JSON 字符串
   * @throws {GeneralInternalServerException} 序列化失败
   * @private
   */
  private serialize(): string {
    try {
      return JSON.stringify(this.value, this.getReplacer());
    } catch (error) {
      throw new GeneralInternalServerException(
        '缓存值序列化失败',
        '无法序列化缓存值',
        { key: this.key.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }
  
  /**
   * 获取 JSON 序列化的 replacer 函数
   * 
   * @description 处理循环引用和特殊类型
   * 
   * ## 特殊类型处理
   * 
   * - Date → { __type: 'Date', value: ISOString }
   * - Set → { __type: 'Set', value: Array }
   * - Map → { __type: 'Map', value: Array<[key, value]> }
   * - Buffer → { __type: 'Buffer', value: base64 }
   * - 循环引用 → '[Circular]'
   * 
   * @returns replacer 函数
   * @private
   */
  private getReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();
    
    return (key: string, value: any) => {
      // 处理循环引用
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      // 处理特殊类型
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      if (value instanceof Set) {
        return { __type: 'Set', value: Array.from(value) };
      }
      if (value instanceof Map) {
        return { __type: 'Map', value: Array.from(value.entries()) };
      }
      if (Buffer.isBuffer(value)) {
        return { __type: 'Buffer', value: value.toString('base64') };
      }
      
      return value;
    };
  }
  
  /**
   * 验证值大小
   * 
   * @throws {GeneralBadRequestException} 值过大
   * @private
   */
  private validateSize(): void {
    if (this.size > CacheEntry.MAX_SIZE) {
      throw new GeneralBadRequestException(
        '缓存值过大',
        `缓存值不能超过 ${CacheEntry.MAX_SIZE} 字节（1MB）`,
        { 
          key: this.key.toString(), 
          size: this.size, 
          max: CacheEntry.MAX_SIZE 
        }
      );
    }
  }
  
  /**
   * 获取序列化后的值
   * 
   * @returns 序列化的 JSON 字符串
   */
  getSerializedValue(): string {
    return this.serializedValue;
  }
  
  /**
   * 获取原始值
   * 
   * @returns 原始缓存值
   */
  getValue(): T {
    return this.value;
  }
  
  /**
   * 获取 TTL
   * 
   * @returns 过期时间（秒）
   */
  getTTL(): number {
    return this.ttl;
  }
  
  /**
   * 获取缓存键
   * 
   * @returns CacheKey 值对象
   */
  getKey(): CacheKey {
    return this.key;
  }
  
  /**
   * 获取值大小（字节）
   * 
   * @returns 序列化后的值大小
   */
  getSize(): number {
    return this.size;
  }
  
  /**
   * 获取创建时间
   * 
   * @returns 创建时间
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }
  
  /**
   * 检查是否即将过期（剩余时间 < 10%）
   * 
   * @param currentTime - 当前时间（默认为当前系统时间）
   * @returns 如果即将过期返回 true，否则返回 false
   * 
   * @example
   * ```typescript
   * if (entry.isExpiringSoon()) {
   *   console.log('缓存即将过期，考虑预热');
   * }
   * ```
   */
  isExpiringSoon(currentTime: Date = new Date()): boolean {
    if (this.ttl === 0) {
      return false; // 永不过期
    }
    
    const elapsed = (currentTime.getTime() - this.createdAt.getTime()) / 1000;
    const remaining = this.ttl - elapsed;
    const threshold = this.ttl * 0.1;
    
    return remaining < threshold && remaining > 0;
  }
  
  /**
   * 检查是否已过期
   * 
   * @param currentTime - 当前时间（默认为当前系统时间）
   * @returns 如果已过期返回 true，否则返回 false
   * 
   * @example
   * ```typescript
   * if (entry.isExpired()) {
   *   console.log('缓存已过期，需要删除');
   * }
   * ```
   */
  isExpired(currentTime: Date = new Date()): boolean {
    if (this.ttl === 0) {
      return false; // 永不过期
    }
    
    const elapsed = (currentTime.getTime() - this.createdAt.getTime()) / 1000;
    return elapsed >= this.ttl;
  }
}

