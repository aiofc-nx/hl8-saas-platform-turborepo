/**
 * RedisService 单元测试
 * 
 * @description 测试 Redis 服务的基础功能（不依赖真实 Redis）
 * 
 * @group services
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RedisService, REDIS_OPTIONS } from './redis.service.js';
import type { RedisOptions } from '../types/redis-options.interface.js';

describe('RedisService', () => {
  let service: RedisService;
  
  const testOptions: RedisOptions = {
    host: 'localhost',
    port: 6379,
    db: 0,
    connectTimeout: 5000,
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_OPTIONS,
          useValue: testOptions,
        },
      ],
    }).compile();
    
    service = module.get<RedisService>(RedisService);
  });
  
  describe('配置注入', () => {
    it('应该正确注入配置', () => {
      expect(service).toBeDefined();
    });
  });
  
  describe('getClient()', () => {
    it('应该在未连接时抛出异常', () => {
      expect(() => service.getClient()).toThrow('Redis 未连接');
    });
  });
  
  describe('isClientConnected()', () => {
    it('应该在未连接时返回 false', () => {
      expect(service.isClientConnected()).toBe(false);
    });
  });
  
  describe('healthCheck()', () => {
    it('应该在未连接时返回 false', async () => {
      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });
  
  describe('disconnect()', () => {
    it('应该安全处理未连接的情况', async () => {
      await expect(service.disconnect()).resolves.not.toThrow();
    });
  });
});
