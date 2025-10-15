/**
 * 用户 ID 值对象
 *
 * @description 封装用户标识符，使用 UUID v4 格式
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";

export class UserId extends EntityId<"UserId"> {
  private static cache = new Map<string, UserId>();

  private constructor(value: string) {
    super(value, "UserId");
  }

  static create(value: string): UserId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new UserId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的用户 ID
   *
   * @returns 新生成的 UserId 实例
   *
   * @example
   * ```typescript
   * const userId = UserId.generate();
   * ```
   */
  static generate(): UserId {
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

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: UserId): boolean {
    return super.equals(other);
  }
}
