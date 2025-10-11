/**
 * 租户 ID 值对象
 *
 * @description 租户的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo';

/**
 * 租户 ID
 */
export class TenantId extends EntityId {
  private constructor(value: string) {
    super();
    // 使用父类的 create 方法进行验证
    const validated = EntityId.create(value);
    Object.assign(this, validated);
  }

  /**
   * 创建租户 ID
   *
   * @param value - UUID 字符串
   * @returns TenantId 实例
   */
  static override create(value: string): TenantId {
    return new TenantId(value);
  }

  /**
   * 生成新的租户 ID
   *
   * @returns TenantId 实例
   */
  static override generate(): TenantId {
    const id = EntityId.generate();
    return TenantId.create(id.value);
  }
}

