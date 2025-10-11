/**
 * RedisService 单元测试
 */

import { RedisService, RedisOptions } from './redis.service.js';
import { GeneralInternalServerException } from '../exceptions/core/general-internal-server.exception.js';

// Mock ioredis
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue('OK'),
    })),
  };
});

describe('RedisService', () => {
  let service: RedisService;
  let options: RedisOptions;

  beforeEach(() => {
    options = {
      host: 'localhost',
      port: 6379,
    };
  });

  describe('connect', () => {
    it('应该成功连接到 Redis', async () => {
      service = new RedisService(options);
      
      await expect(service.connect()).resolves.not.toThrow();
    });

    it('连接失败应该抛出异常', async () => {
      const Redis = require('ioredis').Redis;
      Redis.mockImplementationOnce(() => ({
        on: jest.fn(),
        ping: jest.fn().mockRejectedValue(new Error('Connection refused')),
      }));

      service = new RedisService(options);

      await expect(service.connect()).rejects.toThrow(
        GeneralInternalServerException,
      );
    });
  });

  describe('getClient', () => {
    it('连接后应该返回 Redis 客户端', async () => {
      service = new RedisService(options);
      await service.connect();

      const client = service.getClient();

      expect(client).toBeDefined();
    });

    it('未连接时应该抛出异常', () => {
      service = new RedisService(options);

      expect(() => service.getClient()).toThrow(GeneralInternalServerException);
    });
  });

  describe('healthCheck', () => {
    it('连接正常时应该返回 true', async () => {
      service = new RedisService(options);
      await service.connect();

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('未连接时应该返回 false', async () => {
      service = new RedisService(options);

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });
});

