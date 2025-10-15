/**
 * 租户 ID 值对象
 *
 * @description 封装租户标识符，使用 UUID v4 格式
 *
 * ## 业务规则
 *
 * ### UUID v4 格式
 * - 格式: 8-4-4-4-12 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * - 版本: UUID v4（随机生成）
 * - 示例: `550e8400-e29b-41d4-a716-446655440000`
 *
 * ### Flyweight 模式
 * - 相同值返回相同实例
 * - 减少内存占用
 *
 * @example
 * ```typescript
 * // 创建租户 ID
 * const id1 = TenantId.create('550e8400-e29b-41d4-a716-446655440000');
 * const id2 = TenantId.create('550e8400-e29b-41d4-a716-446655440000');
 *
 * console.log(id1 === id2); // true（Flyweight 模式）
 * console.log(id1.getValue()); // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";

export class TenantId extends EntityId<"TenantId"> {
  private static cache = new Map<string, TenantId>();

  /**
   * 私有构造函数
   */
  private constructor(value: string) {
    super(value, "TenantId");
  }

  /**
   * 创建租户 ID（使用 Flyweight 模式）
   *
   * @param value - UUID v4 字符串
   * @returns TenantId 实例
   * @throws {IsolationValidationError} 如果不是有效的 UUID v4
   *
   * @example
   * ```typescript
   * const tenantId = TenantId.create('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  static create(value: string): TenantId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new TenantId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的租户 ID
   *
   * @returns 新生成的 TenantId 实例
   *
   * @example
   * ```typescript
   * const tenantId = TenantId.generate();
   * ```
   */
  static generate(): TenantId {
    // 生成 UUID v4
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
    return this.create(uuid);
  }

  /**
   * 清除缓存（测试用途）
   *
   * @internal
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * 值对象相等性比较（类型安全）
   *
   * @param other - 另一个 TenantId 实例
   * @returns 如果值相同返回 true
   */
  override equals(other?: TenantId): boolean {
    return super.equals(other);
  }
}
