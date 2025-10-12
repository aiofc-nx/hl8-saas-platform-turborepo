/**
 * DepartmentId 值对象单元测试
 */

import { DepartmentId } from './department-id.vo.js';
import { IsolationValidationError } from '../errors/isolation-validation.error.js';

describe('DepartmentId', () => {
  const validUuid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  
  beforeEach(() => {
    DepartmentId.clearCache();
  });
  
  it('应该创建有效的 DepartmentId', () => {
    const id = DepartmentId.create(validUuid);
    expect(id.getValue()).toBe(validUuid);
  });
  
  it('应该使用 Flyweight 模式', () => {
    const id1 = DepartmentId.create(validUuid);
    const id2 = DepartmentId.create(validUuid);
    expect(id1).toBe(id2);
  });
  
  it('应该拒绝无效的 UUID', () => {
    expect(() => DepartmentId.create('not-a-uuid')).toThrow(IsolationValidationError);
  });
});
