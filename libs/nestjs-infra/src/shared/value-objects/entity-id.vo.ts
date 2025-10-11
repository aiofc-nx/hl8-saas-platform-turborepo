/**
 * 实体 ID 值对象
 *
 * @description 表示实体的唯一标识符，基于 UUID
 *
 * ## 业务规则
 *
 * ### ID 格式规则
 * - 必须是有效的 UUID v4 格式
 * - 不可变更（创建后不能修改）
 * - 不能为空
 *
 * ### 相等性规则
 * - 两个 EntityId 相等当且仅当其 value 相同
 * - 比较时忽略大小写
 *
 * @example
 * ```typescript
 * // 生成新 ID
 * const id = EntityId.generate();
 *
 * // 从现有值创建
 * const id = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
 *
 * // 相等性比较
 * const id1 = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
 * const id2 = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
 * console.log(id1.equals(id2)); // true
 * ```
 *
 * @since 0.1.0
 */

import { randomUUID } from 'crypto';

/**
 * 实体 ID 值对象
 *
 * @description 封装实体的唯一标识符
 */
export class EntityId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!EntityId.isValid(value)) {
      throw new Error(`无效的实体 ID: ${value}`);
    }
    this._value = value.toLowerCase();
  }

  /**
   * 获取 ID 值
   *
   * @returns UUID 字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 生成新的实体 ID
   *
   * @returns 新的 EntityId 实例
   *
   * @example
   * ```typescript
   * const id = EntityId.generate();
   * console.log(id.value); // "123e4567-e89b-12d3-a456-426614174000"
   * ```
   */
  static generate(): EntityId {
    return new EntityId(randomUUID());
  }

  /**
   * 从字符串创建实体 ID
   *
   * @param value - UUID 字符串
   * @returns EntityId 实例
   * @throws 如果 value 不是有效的 UUID
   *
   * @example
   * ```typescript
   * const id = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
   * ```
   */
  static create(value: string): EntityId {
    return new EntityId(value);
  }

  /**
   * 验证是否为有效的 UUID
   *
   * @param value - 待验证的字符串
   * @returns 如果是有效的 UUID 则返回 true
   *
   * @example
   * ```typescript
   * EntityId.isValid('123e4567-e89b-12d3-a456-426614174000'); // true
   * EntityId.isValid('invalid-uuid'); // false
   * ```
   */
  static isValid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * 比较两个实体 ID 是否相等
   *
   * @param other - 另一个 EntityId
   * @returns 如果相等则返回 true
   *
   * @example
   * ```typescript
   * const id1 = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
   * const id2 = EntityId.create('123e4567-e89b-12d3-a456-426614174000');
   * id1.equals(id2); // true
   * ```
   */
  equals(other: EntityId): boolean {
    return this._value === other._value;
  }

  /**
   * 转换为字符串
   *
   * @returns UUID 字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 转换为 JSON
   *
   * @returns UUID 字符串
   */
  toJSON(): string {
    return this._value;
  }
}

