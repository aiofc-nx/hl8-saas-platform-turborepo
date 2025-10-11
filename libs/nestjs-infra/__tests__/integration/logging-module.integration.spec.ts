/**
 * LoggingModule 集成测试
 *
 * @description 测试 LoggingModule 的动态配置、Fastify Pino 集成和服务注入
 */

import { Test, type TestingModule } from '@nestjs/testing';
import { LoggingModule } from '../../src/logging/logger.module.js';
import { LoggerService } from '../../src/logging/logger.service.js';
import { LoggingModuleConfig } from '../../src/logging/config/logging.config.js';
import type { DynamicModule } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

describe('LoggingModule 集成测试', () => {
  describe('forRoot - 同步配置', () => {
    let module: TestingModule;
    let loggerService: LoggerService;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该使用默认配置成功加载模块', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      module = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      loggerService = module.get<LoggerService>(LoggerService);

      expect(loggerService).toBeDefined();
      expect(loggerService).toBeInstanceOf(LoggerService);
    });

    it('应该正确注入 LoggerService', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'debug',
        prettyPrint: true,
      });

      module = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const service = module.get<LoggerService>(LoggerService);

      expect(service).toBeInstanceOf(LoggerService);
      expect(typeof service.log).toBe('function');
      expect(typeof service.error).toBe('function');
      expect(typeof service.warn).toBe('function');
      expect(typeof service.debug).toBe('function');
    });

    it('应该支持不同的日志级别配置', async () => {
      const levels: Array<'debug' | 'info' | 'warn' | 'error'> = [
        'debug',
        'info',
        'warn',
        'error',
      ];

      for (const level of levels) {
        const config = plainToInstance(LoggingModuleConfig, {
          level,
          prettyPrint: false,
        });

        const testModule = await Test.createTestingModule({
          imports: [LoggingModule.forRoot(config)],
        }).compile();

        const service = testModule.get<LoggerService>(LoggerService);

        expect(service).toBeDefined();

        await testModule.close();
      }
    });
  });

  describe('配置验证', () => {
    it('应该验证配置对象', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        // @ts-expect-error - 测试无效的日志级别
        level: 'invalid-level',
        prettyPrint: false,
      });

      await expect(
        Test.createTestingModule({
          imports: [LoggingModule.forRoot(config)],
        }).compile(),
      ).rejects.toThrow();
    });

    it('应该验证 prettyPrint 类型', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        // @ts-expect-error - 测试无效的 prettyPrint 类型
        prettyPrint: 'invalid',
      });

      await expect(
        Test.createTestingModule({
          imports: [LoggingModule.forRoot(config)],
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

    it('应该导出 LoggerService 供其他模块使用', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      module = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const service = module.get<LoggerService>(LoggerService);

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(LoggerService);
    });

    it('LoggerService 应该可以在其他服务中被注入', async () => {
      // 创建一个使用 LoggerService 的测试服务
      class TestService {
        constructor(private readonly logger: LoggerService) {}

        logMessage(message: string) {
          this.logger.log(message);
        }
      }

      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      module = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
        providers: [TestService],
      }).compile();

      const testService = module.get<TestService>(TestService);

      expect(testService).toBeDefined();
      expect(() => testService.logMessage('test')).not.toThrow();
    });
  });

  describe('模块元数据', () => {
    it('forRoot 应该返回 DynamicModule', () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      const dynamicModule = LoggingModule.forRoot(config);

      expect(dynamicModule).toHaveProperty('module');
      expect(dynamicModule).toHaveProperty('providers');
      expect(dynamicModule).toHaveProperty('exports');
      expect((dynamicModule as DynamicModule).module).toBe(LoggingModule);
      expect((dynamicModule as DynamicModule).global).toBe(true);
    });

    it('模块应该是全局模块', () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      const dynamicModule = LoggingModule.forRoot(config);

      expect((dynamicModule as DynamicModule).global).toBe(true);
    });
  });

  describe('日志功能测试', () => {
    let module: TestingModule;
    let loggerService: LoggerService;

    beforeEach(async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'debug',
        prettyPrint: false,
      });

      module = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      loggerService = module.get<LoggerService>(LoggerService);
    });

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该支持所有日志方法', () => {
      expect(() => loggerService.log('test message')).not.toThrow();
      expect(() => loggerService.error('error message')).not.toThrow();
      expect(() => loggerService.warn('warning message')).not.toThrow();
      expect(() => loggerService.debug('debug message')).not.toThrow();
    });

    it('应该支持带上下文的日志', () => {
      expect(() =>
        loggerService.log('test', { userId: '123', action: 'login' }),
      ).not.toThrow();
    });

    it('应该支持 getPinoLogger 方法', () => {
      const pinoLogger = loggerService.getPinoLogger();

      expect(pinoLogger).toBeDefined();
      expect(typeof pinoLogger.info).toBe('function');
    });
  });

  describe('多次导入', () => {
    it('应该支持模块多次导入', async () => {
      const config = plainToInstance(LoggingModuleConfig, {
        level: 'info',
        prettyPrint: false,
      });

      // 创建两个独立的模块实例
      const module1 = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const module2 = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const service1 = module1.get<LoggerService>(LoggerService);
      const service2 = module2.get<LoggerService>(LoggerService);

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();

      await module1.close();
      await module2.close();
    });
  });
});

