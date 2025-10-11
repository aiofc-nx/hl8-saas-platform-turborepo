/**
 * ConfigCacheService 单元测试
 */

import { ConfigCacheService } from './config-cache.service.js';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;

  beforeEach(() => {
    service = new ConfigCacheService();
  });

  describe('set and get', () => {
    it('应该成功设置和获取配置', () => {
      const value = { host: 'localhost', port: 3000 };

      service.set('app.server', value);
      const result = service.get<typeof value>('app.server');

      expect(result).toEqual(value);
    });

    it('获取不存在的配置应该返回 undefined', () => {
      const result = service.get('non-existent');

      expect(result).toBeUndefined();
    });

    it('应该支持更新配置', () => {
      service.set('app.name', 'v1');
      service.set('app.name', 'v2');

      const result = service.get('app.name');

      expect(result).toBe('v2');
    });
  });

  describe('has', () => {
    it('存在的配置应该返回 true', () => {
      service.set('app.name', 'test');

      expect(service.has('app.name')).toBe(true);
    });

    it('不存在的配置应该返回 false', () => {
      expect(service.has('non-existent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('应该成功删除配置', () => {
      service.set('app.name', 'test');
      
      service.delete('app.name');

      expect(service.has('app.name')).toBe(false);
      expect(service.get('app.name')).toBeUndefined();
    });

    it('删除不存在的配置应该正常返回', () => {
      expect(() => service.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('应该清空所有缓存', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      service.clear();

      expect(service.size()).toBe(0);
      expect(service.get('key1')).toBeUndefined();
      expect(service.get('key2')).toBeUndefined();
      expect(service.get('key3')).toBeUndefined();
    });
  });

  describe('getTimestamp', () => {
    it('应该记录配置的更新时间', () => {
      const before = Date.now();
      service.set('app.name', 'test');
      const after = Date.now();

      const timestamp = service.getTimestamp('app.name');

      expect(timestamp).toBeDefined();
      expect(timestamp!).toBeGreaterThanOrEqual(before);
      expect(timestamp!).toBeLessThanOrEqual(after);
    });

    it('不存在的配置应该返回 undefined', () => {
      const timestamp = service.getTimestamp('non-existent');

      expect(timestamp).toBeUndefined();
    });

    it('更新配置应该更新时间戳', async () => {
      service.set('app.name', 'v1');
      const timestamp1 = service.getTimestamp('app.name');

      await new Promise((resolve) => setTimeout(resolve, 10));
      
      service.set('app.name', 'v2');
      const timestamp2 = service.getTimestamp('app.name');

      expect(timestamp2).toBeGreaterThan(timestamp1!);
    });
  });

  describe('size', () => {
    it('空缓存应该返回 0', () => {
      expect(service.size()).toBe(0);
    });

    it('应该正确统计缓存条目数', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      expect(service.size()).toBe(3);
    });

    it('删除配置后应该减少', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');

      service.delete('key1');

      expect(service.size()).toBe(1);
    });
  });
});

