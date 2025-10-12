/**
 * 部门 ID 值对象
 * 
 * @description 封装部门标识符，使用 UUID v4 格式
 * 
 * @since 1.0.0
 */

import { EntityId } from './entity-id.vo.js';

export class DepartmentId extends EntityId<'DepartmentId'> {
  private static cache = new Map<string, DepartmentId>();
  
  private constructor(value: string) {
    super(value, 'DepartmentId');
  }
  
  static create(value: string): DepartmentId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new DepartmentId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
  
  override equals(other?: DepartmentId): boolean {
    return super.equals(other);
  }
}

