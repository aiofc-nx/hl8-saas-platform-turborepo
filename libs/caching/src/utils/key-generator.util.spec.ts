/**
 * 键生成工具单元测试
 */

import {
  generateKey,
  generatePattern,
  isValidKey,
  sanitizeKey,
} from './key-generator.util.js';

describe('key-generator.util', () => {
  describe('generateKey()', () => {
    it('应该生成简单键', () => {
      const key = generateKey(['user', 'profile', '123']);
      expect(key).toBe('user:profile:123');
    });

    it('应该过滤空值', () => {
      const key = generateKey(['user', '', null, undefined, 'list']);
      expect(key).toBe('user:list');
    });

    it('应该处理数字', () => {
      const key = generateKey(['user', 123, 'profile']);
      expect(key).toBe('user:123:profile');
    });

    it('应该清理非法字符', () => {
      const key = generateKey(['user name', 'profile @123']);
      expect(key).toBe('username:profile123');
    });

    it('应该返回空字符串当所有部分都为空时', () => {
      const key = generateKey(['', null, undefined]);
      expect(key).toBe('');
    });
  });

  describe('sanitizeKey()', () => {
    it('应该移除空格', () => {
      const clean = sanitizeKey('user name');
      expect(clean).toBe('username');
    });

    it('应该移除换行符', () => {
      const clean = sanitizeKey('user\nname');
      expect(clean).toBe('username');
    });

    it('应该移除制表符', () => {
      const clean = sanitizeKey('user\tname');
      expect(clean).toBe('username');
    });

    it('应该移除控制字符', () => {
      const clean = sanitizeKey('user\x00name');
      expect(clean).toBe('username');
    });

    it('应该保留字母数字', () => {
      const clean = sanitizeKey('user123');
      expect(clean).toBe('user123');
    });

    it('应该保留下划线', () => {
      const clean = sanitizeKey('user_name');
      expect(clean).toBe('user_name');
    });

    it('应该保留横线', () => {
      const clean = sanitizeKey('user-name');
      expect(clean).toBe('user-name');
    });

    it('应该保留冒号', () => {
      const clean = sanitizeKey('user:name');
      expect(clean).toBe('user:name');
    });

    it('应该移除特殊字符', () => {
      const clean = sanitizeKey('user@#$%name');
      expect(clean).toBe('username');
    });

    it('应该移除连续冒号', () => {
      const clean = sanitizeKey('user:::name');
      expect(clean).toBe('user:name');
    });

    it('应该移除开头冒号', () => {
      const clean = sanitizeKey(':user');
      expect(clean).toBe('user');
    });

    it('应该移除结尾冒号', () => {
      const clean = sanitizeKey('user:');
      expect(clean).toBe('user');
    });

    it('应该处理复杂情况', () => {
      const clean = sanitizeKey(':::user  @name\n123:::');
      expect(clean).toBe('username123');
    });
  });

  describe('isValidKey()', () => {
    it('应该接受简单键', () => {
      expect(isValidKey('user')).toBe(true);
    });

    it('应该接受带冒号的键', () => {
      expect(isValidKey('user:profile:123')).toBe(true);
    });

    it('应该接受带下划线的键', () => {
      expect(isValidKey('user_profile')).toBe(true);
    });

    it('应该接受带横线的键', () => {
      expect(isValidKey('user-profile')).toBe(true);
    });

    it('应该接受字母数字组合', () => {
      expect(isValidKey('user123')).toBe(true);
    });

    it('应该拒绝空字符串', () => {
      expect(isValidKey('')).toBe(false);
    });

    it('应该拒绝只有空格的字符串', () => {
      expect(isValidKey('   ')).toBe(false);
    });

    it('应该拒绝包含空格的键', () => {
      expect(isValidKey('user name')).toBe(false);
    });

    it('应该拒绝包含换行符的键', () => {
      expect(isValidKey('user\nname')).toBe(false);
    });

    it('应该拒绝包含制表符的键', () => {
      expect(isValidKey('user\tname')).toBe(false);
    });

    it('应该拒绝包含特殊字符的键', () => {
      expect(isValidKey('user@name')).toBe(false);
    });
  });

  describe('generatePattern()', () => {
    it('应该生成简单模式', () => {
      const pattern = generatePattern('cache', 'user:*');
      expect(pattern).toBe('cache:user:*');
    });

    it('应该生成复杂模式', () => {
      const pattern = generatePattern('cache', 'tenant:123:*');
      expect(pattern).toBe('cache:tenant:123:*');
    });

    it('应该处理空前缀', () => {
      const pattern = generatePattern('', 'user:*');
      expect(pattern).toBe('user:*');
    });

    it('应该处理空模式', () => {
      const pattern = generatePattern('cache', '');
      expect(pattern).toBe('cache');
    });
  });
});
