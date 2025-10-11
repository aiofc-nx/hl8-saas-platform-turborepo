/**
 * 组织 ID 值对象
 *
 * @description 组织的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo';

/**
 * 组织 ID
 */
export class OrganizationId extends EntityId {
  private constructor(value: string) {
    super();
    const validated = EntityId.create(value);
    Object.assign(this, validated);
  }

  static override create(value: string): OrganizationId {
    return new OrganizationId(value);
  }

  static override generate(): OrganizationId {
    const id = EntityId.generate();
    return OrganizationId.create(id.value);
  }
}

