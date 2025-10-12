/**
 * 用户 ID 值对象
 * 
 * @description 封装用户标识符，使用 UUID v4 格式
 * 
 * @since 1.0.0
 */

import { EntityId } from './entity-id.vo.js';

export class UserId extends EntityId<'UserId'> {
  private static cache = new Map<string, UserId>();
  
  private constructor(value: string) {
    super(value, 'UserId');
  }
  
  static create(value: string): UserId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new UserId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
  
  override equals(other?: UserId): boolean {
    return super.equals(other);
  }
}

