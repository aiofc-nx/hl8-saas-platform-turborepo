/**
 * 用户 ID 值对象
 *
 * @description 用户的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo.js';

/**
 * 用户 ID
 */
export class UserId extends EntityId {
  protected constructor(value: string) {
    super(value);
  }

  static override create(value: string): UserId {
    return new UserId(value);
  }

  static override generate(): UserId {
    const id = EntityId.generate();
    return UserId.create(id.value);
  }
}

