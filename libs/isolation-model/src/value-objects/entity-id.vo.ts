/**
 * 实体 ID 值对象基类
 *
 * @description 所有实体 ID 的基础值对象，使用 UUID v4 格式
 *
 * ## 业务规则
 *
 * ### UUID v4 格式规则
 * - 格式: 8-4-4-4-12 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * - 版本: UUID v4（随机生成）
 * - 长度: 36 字符（含连字符）
 * - 示例: `550e8400-e29b-41d4-a716-446655440000`
 *
 * ### 不可变性
 * - 值对象创建后不可修改
 * - 所有属性只读
 *
 * ### Flyweight 模式
 * - 相同值返回相同实例
 * - 减少内存占用
 *
 * ## 设计模式
 *
 * 本类是一个抽象基类模板，子类通过继承获得：
 * - UUID v4 验证
 * - Flyweight 缓存
 * - equals/getValue/toString 方法
 *
 * @example
 * ```typescript
 * // 子类实现
 * export class TenantId extends EntityId<'TenantId'> {
 *   protected static override cache = new Map<string, TenantId>();
 *
 *   static create(value: string): TenantId {
 *     return this.createInstance(TenantId, value);
 *   }
 * }
 *
 * // 使用
 * const id = TenantId.create('550e8400-e29b-41d4-a716-446655440000');
 * console.log(id.getValue());
 * ```
 *
 * @since 1.0.0
 */

import { IsolationValidationError } from '../errors/isolation-validation.error.js';

/**
 * UUID v4 正则表达式
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 实体 ID 基类（抽象）
 *
 * @template TType - 类型标识（用于类型安全）
 */
export abstract class EntityId<TType extends string = string> {
  /**
   * 保护的构造函数 - 子类通过静态工厂方法创建
   *
   * @param value - UUID v4 字符串
   * @param typeName - 类型名称（用于错误消息）
   */
  protected constructor(
    private readonly value: string,
    private readonly typeName: string,
  ) {
    this.validate();
  }

  /**
   * 验证 UUID v4 格式
   *
   * @throws {IsolationValidationError} 如果格式无效
   * @private
   */
  private validate(): void {
    if (!this.value || typeof this.value !== 'string') {
      throw new IsolationValidationError(
        `${this.typeName} 必须是非空字符串`,
        `INVALID_${this.typeName.toUpperCase()}`,
        { value: this.value },
      );
    }

    if (!UUID_V4_REGEX.test(this.value)) {
      throw new IsolationValidationError(
        `${this.typeName} 必须是有效的 UUID v4 格式`,
        `INVALID_${this.typeName.toUpperCase()}_FORMAT`,
        { value: this.value },
      );
    }
  }

  /**
   * 获取 ID 值
   *
   * @returns UUID v4 字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 值对象相等性比较
   *
   * @param other - 另一个实体 ID
   * @returns 如果值相同返回 true
   */
  equals(other?: EntityId<TType>): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * 字符串表示
   *
   * @returns UUID v4 字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 获取哈希码
   *
   * @returns 哈希码字符串
   */
  getHashCode(): string {
    return this.value;
  }

  /**
   * 比较方法
   *
   * @param other - 另一个实体 ID
   * @returns 比较结果：负数表示小于，0表示等于，正数表示大于
   */
  compareTo(other?: EntityId<TType>): number {
    if (!other) return 1;
    return this.value.localeCompare(other.value);
  }

  /**
   * 检查是否为空
   *
   * @returns 如果为空返回 true
   */
  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }
}
