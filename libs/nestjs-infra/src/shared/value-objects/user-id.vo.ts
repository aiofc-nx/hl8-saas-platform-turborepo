/**
 * 用户 ID 值对象
 *
 * @description 用户的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo';

/**
 * 用户 ID
 */
export class UserId extends EntityId {
  private constructor(value: string) {
    super();
    const validated = EntityId.create(value);
    Object.assign(this, validated);
  }

  static override create(value: string): UserId {
    return new UserId(value);
  }

  static override generate(): UserId {
    const id = EntityId.generate();
    return UserId.create(id.value);
  }
}

