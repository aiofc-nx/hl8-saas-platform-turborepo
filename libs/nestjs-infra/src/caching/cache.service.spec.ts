/**
 * CacheService 单元测试
 */

import { CacheService } from './cache.service.js';
import { GeneralInternalServerException } from '../exceptions/core/general-internal-server.exception.js';
import type { Redis } from 'ioredis';

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: jest.Mocked<Redis>;
  let mockOptions: { defaultTTL: number; keyPrefix: string };

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
    } as any;

    mockOptions = {
      defaultTTL: 3600,
      keyPrefix: 'hl8:cache:',
    };

    service = new CacheService(mockRedis, mockOptions);
  });

  describe('get', () => {
    it('应该成功获取缓存值', async () => {
      const mockValue = { name: 'test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockValue));

      const result = await service.get<typeof mockValue>('test-key');

      expect(result).toEqual(mockValue);
      expect(mockRedis.get).toHaveBeenCalledWith('hl8:cache:test-key');
    });

    it('缓存不存在时应该返回 null', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });

    it('Redis 操作失败应该抛出异常', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));

      await expect(service.get('test-key')).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe('set', () => {
    it('应该成功设置缓存值（使用默认 TTL）', async () => {
      const value = { name: 'test' };
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('test-key', value);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'hl8:cache:test-key',
        3600,
        JSON.stringify(value),
      );
    });

    it('应该成功设置缓存值（自定义 TTL）', async () => {
      const value = { name: 'test' };
      mockRedis.setex.mockResolvedValue('OK');

      await service.set('test-key', value, 600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'hl8:cache:test-key',
        600,
        JSON.stringify(value),
      );
    });

    it('Redis 操作失败应该抛出异常', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Connection failed'));

      await expect(service.set('test-key', { name: 'test' })).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe('del', () => {
    it('应该成功删除缓存', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('hl8:cache:test-key');
    });

    it('Redis 操作失败应该抛出异常', async () => {
      mockRedis.del.mockRejectedValue(new Error('Connection failed'));

      await expect(service.del('test-key')).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe('exists', () => {
    it('缓存存在时应该返回 true', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('hl8:cache:test-key');
    });

    it('缓存不存在时应该返回 false', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await service.exists('non-existent');

      expect(result).toBe(false);
    });

    it('Redis 操作失败应该抛出异常', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Connection failed'));

      await expect(service.exists('test-key')).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe('clear', () => {
    it('应该清空所有缓存', async () => {
      mockRedis.keys.mockResolvedValue(['hl8:cache:key1', 'hl8:cache:key2']);
      mockRedis.del.mockResolvedValue(2);

      await service.clear();

      expect(mockRedis.keys).toHaveBeenCalledWith('hl8:cache:*');
      expect(mockRedis.del).toHaveBeenCalledWith('hl8:cache:key1', 'hl8:cache:key2');
    });

    it('应该清空指定模式的缓存', async () => {
      mockRedis.keys.mockResolvedValue(['hl8:cache:user:1', 'hl8:cache:user:2']);
      mockRedis.del.mockResolvedValue(2);

      await service.clear('user:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('hl8:cache:user:*');
    });

    it('没有匹配的键时应该正常返回', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await service.clear();

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('Redis 操作失败应该抛出异常', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Connection failed'));

      await expect(service.clear()).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });
});

