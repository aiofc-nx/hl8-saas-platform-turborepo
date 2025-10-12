/**
 * OrganizationId 值对象单元测试
 */

import { OrganizationId } from './organization-id.vo.js';
import { IsolationValidationError } from '../errors/isolation-validation.error.js';

describe('OrganizationId', () => {
  const validUuid = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
  
  beforeEach(() => {
    OrganizationId.clearCache();
  });
  
  it('应该创建有效的 OrganizationId', () => {
    const id = OrganizationId.create(validUuid);
    expect(id.getValue()).toBe(validUuid);
  });
  
  it('应该使用 Flyweight 模式', () => {
    const id1 = OrganizationId.create(validUuid);
    const id2 = OrganizationId.create(validUuid);
    expect(id1).toBe(id2);
  });
  
  it('应该拒绝无效的 UUID', () => {
    expect(() => OrganizationId.create('not-a-uuid')).toThrow(IsolationValidationError);
  });
});
