/**
 * EntityId 单元测试
 */

import { EntityId } from './entity-id.vo.js';

describe('EntityId', () => {
  describe('generate', () => {
    it('应该生成有效的 UUID', () => {
      const id = EntityId.generate();

      expect(id).toBeInstanceOf(EntityId);
      expect(id.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('每次生成的 ID 应该不同', () => {
      const id1 = EntityId.generate();
      const id2 = EntityId.generate();

      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('create', () => {
    it('应该从有效的 UUID 创建实例', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      
      const id = EntityId.create(uuid);

      expect(id).toBeInstanceOf(EntityId);
      expect(id.value).toBe(uuid.toLowerCase());
    });

    it('应该自动转换为小写', () => {
      const uuid = '123E4567-E89B-12D3-A456-426614174000';
      
      const id = EntityId.create(uuid);

      expect(id.value).toBe(uuid.toLowerCase());
    });

    it('无效的 UUID 应该抛出错误', () => {
      expect(() => EntityId.create('invalid-uuid')).toThrow('无效的实体 ID');
    });

    it('空字符串应该抛出错误', () => {
      expect(() => EntityId.create('')).toThrow('无效的实体 ID');
    });
  });

  describe('isValid', () => {
    it('有效的 UUID 应该返回 true', () => {
      expect(EntityId.isValid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('大写的 UUID 应该返回 true', () => {
      expect(EntityId.isValid('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });

    it('无效的 UUID 应该返回 false', () => {
      expect(EntityId.isValid('invalid-uuid')).toBe(false);
      expect(EntityId.isValid('')).toBe(false);
      expect(EntityId.isValid('123')).toBe(false);
    });
  });

  describe('equals', () => {
    it('相同 ID 应该相等', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = EntityId.create(uuid);
      const id2 = EntityId.create(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('不同 ID 应该不相等', () => {
      const id1 = EntityId.generate();
      const id2 = EntityId.generate();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('应该返回 UUID 字符串', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id = EntityId.create(uuid);

      expect(id.toString()).toBe(uuid.toLowerCase());
    });
  });
});

