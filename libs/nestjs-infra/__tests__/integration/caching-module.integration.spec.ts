/**
 * CachingModule 集成测试
 *
 * @description 测试 CachingModule 的动态配置、服务注入和 Redis 集成
 */

import { Test, type TestingModule } from '@nestjs/testing';
import { CachingModule } from '../../src/caching/cache.module.js';
import { CacheService } from '../../src/caching/cache.service.js';
import { RedisService } from '../../src/caching/redis.service.js';
import { CachingModuleConfig, RedisConfig } from '../../src/caching/config/caching.config.js';
import type { DynamicModule } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

describe('CachingModule 集成测试', () => {
  describe('forRoot - 同步配置', () => {
    let module: TestingModule;
    let cacheService: CacheService;
    let redisService: RedisService;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该使用默认配置成功加载模块', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
        ttl: 300,
        keyPrefix: 'test:',
      });

      module = await Test.createTestingModule({
        imports: [CachingModule.forRoot(config)],
      }).compile();

      cacheService = module.get<CacheService>(CacheService);
      redisService = module.get<RedisService>(RedisService);

      expect(cacheService).toBeDefined();
      expect(redisService).toBeDefined();
    });

    it('应该正确注入 CacheService', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
        ttl: 300,
      });

      module = await Test.createTestingModule({
        imports: [CachingModule.forRoot(config)],
      }).compile();

      const service = module.get<CacheService>(CacheService);

      expect(service).toBeInstanceOf(CacheService);
      expect(typeof service.get).toBe('function');
      expect(typeof service.set).toBe('function');
      expect(typeof service.del).toBe('function');
    });

    it('应该正确注入 RedisService', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
      });

      module = await Test.createTestingModule({
        imports: [CachingModule.forRoot(config)],
      }).compile();

      const service = module.get<RedisService>(RedisService);

      expect(service).toBeInstanceOf(RedisService);
      expect(typeof service.getClient).toBe('function');
      expect(typeof service.healthCheck).toBe('function');
    });
  });

  describe('forRootAsync - 异步配置', () => {
    let module: TestingModule;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该支持 useFactory 异步配置', async () => {
      module = await Test.createTestingModule({
        imports: [
          CachingModule.forRootAsync({
            useFactory: () => {
              return plainToInstance(CachingModuleConfig, {
                redis: {
                  host: 'localhost',
                  port: 6379,
                  db: 0,
                },
                ttl: 600,
                keyPrefix: 'async:',
              });
            },
          }),
        ],
      }).compile();

      const cacheService = module.get<CacheService>(CacheService);

      expect(cacheService).toBeDefined();
    });

    it('应该支持带依赖注入的 useFactory', async () => {
      // 模拟配置服务
      class ConfigService {
        get(key: string): any {
          return key === 'cache.ttl' ? 900 : 'localhost';
        }
      }

      module = await Test.createTestingModule({
        imports: [
          CachingModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
              return plainToInstance(CachingModuleConfig, {
                redis: {
                  host: configService.get('cache.host'),
                  port: 6379,
                  db: 0,
                },
                ttl: configService.get('cache.ttl'),
                keyPrefix: 'di:',
              });
            },
            inject: [ConfigService],
          }),
        ],
        providers: [ConfigService],
      }).compile();

      const cacheService = module.get<CacheService>(CacheService);

      expect(cacheService).toBeDefined();
    });
  });

  describe('配置验证', () => {
    it('应该验证配置对象', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        // 缺少必需的 redis 配置
        ttl: 300,
      });

      await expect(
        Test.createTestingModule({
          imports: [CachingModule.forRoot(config)],
        }).compile(),
      ).rejects.toThrow();
    });

    it('应该验证 Redis 端口范围', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 70000, // 无效端口
          db: 0,
        },
      });

      await expect(
        Test.createTestingModule({
          imports: [CachingModule.forRoot(config)],
        }).compile(),
      ).rejects.toThrow();
    });
  });

  describe('模块导出', () => {
    let module: TestingModule;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该导出 CacheService 供其他模块使用', async () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
        keyPrefix: 'export:',
      });

      // 创建一个导入 CachingModule 的测试模块
      module = await Test.createTestingModule({
        imports: [CachingModule.forRoot(config)],
      }).compile();

      const cacheService = module.get<CacheService>(CacheService);

      expect(cacheService).toBeDefined();
      expect(cacheService).toBeInstanceOf(CacheService);
    });
  });

  describe('模块元数据', () => {
    it('forRoot 应该返回 DynamicModule', () => {
      const config = plainToInstance(CachingModuleConfig, {
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0,
        },
        keyPrefix: 'meta:',
      });

      const dynamicModule = CachingModule.forRoot(config);

      expect(dynamicModule).toHaveProperty('module');
      expect(dynamicModule).toHaveProperty('providers');
      expect(dynamicModule).toHaveProperty('exports');
      expect((dynamicModule as DynamicModule).module).toBe(CachingModule);
      expect((dynamicModule as DynamicModule).global).toBe(true);
    });

    it('forRootAsync 应该返回 DynamicModule', () => {
      const dynamicModule = CachingModule.forRootAsync({
        useFactory: () => {
          return plainToInstance(CachingModuleConfig, {
            redis: {
              host: 'localhost',
              port: 6379,
              db: 0,
            },
            keyPrefix: 'meta-async:',
          });
        },
      });

      expect(dynamicModule).toHaveProperty('module');
      expect(dynamicModule).toHaveProperty('providers');
      expect(dynamicModule).toHaveProperty('imports');
      expect((dynamicModule as DynamicModule).module).toBe(CachingModule);
      expect((dynamicModule as DynamicModule).global).toBe(true);
    });
  });
});

