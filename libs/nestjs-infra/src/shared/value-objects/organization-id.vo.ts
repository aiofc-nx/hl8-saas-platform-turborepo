/**
 * 组织 ID 值对象
 *
 * @description 组织的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo.js';

/**
 * 组织 ID
 */
export class OrganizationId extends EntityId {
  protected constructor(value: string) {
    super(value);
  }

  static override create(value: string): OrganizationId {
    return new OrganizationId(value);
  }

  static override generate(): OrganizationId {
    const id = EntityId.generate();
    return OrganizationId.create(id.value);
  }
}

