/**
 * 部门 ID 值对象
 *
 * @description 部门的唯一标识符
 *
 * @since 0.2.0
 */

import { EntityId } from './entity-id.vo.js';

/**
 * 部门 ID
 */
export class DepartmentId extends EntityId {
  protected constructor(value: string) {
    super(value);
  }

  static override create(value: string): DepartmentId {
    return new DepartmentId(value);
  }

  static override generate(): DepartmentId {
    const id = EntityId.generate();
    return DepartmentId.create(id.value);
  }
}

