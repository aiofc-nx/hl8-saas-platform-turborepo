/**
 * 日志格式回归测试
 *
 * @description 验证日志序列化问题已修复，确保错误日志以结构化格式输出
 * 防止日志序列化问题再次出现
 *
 * ## 测试规则
 *
 * ### 日志格式验证
 * - 错误日志应包含结构化的 `err` 对象
 * - `err` 对象应包含 `type`、`message`、`stack` 字段
 * - 不应出现字符拆分问题（如 0:"D" 1:"a" ...）
 * - 性能日志和请求日志应保持原有格式
 *
 * ### 测试场景
 * - 正常请求日志格式
 * - 错误请求日志格式
 * - 异常过滤器日志格式
 * - 事务服务日志格式
 *
 * @since 0.1.0
 */

import { TransactionService } from '@hl8/database/index.js';
import {
  EnterpriseFastifyAdapter,
  FastifyLoggerService,
} from '@hl8/nestjs-fastify';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module.js';

describe('日志格式回归测试 (e2e)', () => {
  let app: INestApplication;
  let logger: FastifyLoggerService;
  let transactionService: TransactionService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new EnterpriseFastifyAdapter({
        fastifyOptions: {
          logger: {
            level: 'debug',
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: false, // 测试时禁用颜色
                translateTime: false, // 测试时禁用时间转换
                ignore: 'pid,hostname',
              },
            },
          },
        },
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    logger = app.get(FastifyLoggerService);
    transactionService = app.get(TransactionService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('FastifyLoggerService 日志格式', () => {
    it('应该正确处理字符串消息', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.log('测试消息', { testKey: 'testValue' });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0];
      expect(logOutput).toContain('测试消息');
      expect(logOutput).toContain('testKey');
      expect(logOutput).toContain('testValue');

      consoleSpy.mockRestore();
    });

    it('应该正确处理 Error 对象', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const error = new Error('测试错误');
      logger.error(error, { context: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0];

      // 验证错误日志包含结构化信息
      expect(logOutput).toContain('测试错误');
      expect(logOutput).toContain('context');
      expect(logOutput).toContain('test');

      // 验证不包含字符拆分
      expect(logOutput).not.toMatch(/0:\s*"[A-Za-z]"/);
      expect(logOutput).not.toMatch(/1:\s*"[A-Za-z]"/);

      consoleSpy.mockRestore();
    });

    it('应该正确处理 Error 对象并包含 err 字段', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const error = new Error('结构化错误测试');
      logger.error(error, { transactionId: 'test-tx' });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0];

      // 验证包含结构化错误信息
      expect(logOutput).toContain('err');
      expect(logOutput).toContain('type');
      expect(logOutput).toContain('message');
      expect(logOutput).toContain('stack');
      expect(logOutput).toContain('transactionId');
      expect(logOutput).toContain('test-tx');

      consoleSpy.mockRestore();
    });
  });

  describe('异常过滤器日志格式', () => {
    it('应该正确处理 HTTP 异常', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await app
          .getHttpAdapter()
          .getInstance()
          .inject({
            method: 'POST',
            url: '/users',
            payload: { name: 'test', email: 'invalid-email' },
          });
      } catch (error) {
        // 忽略错误，我们只关心日志格式
      }

      // 等待日志输出
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalled();

      // 验证日志格式
      const logCalls = consoleSpy.mock.calls;
      const errorLogs = logCalls.filter(
        (call) =>
          call[0] && typeof call[0] === 'string' && call[0].includes('ERROR'),
      );

      if (errorLogs.length > 0) {
        const errorLog = errorLogs[0]?.[0];

        // 验证不包含字符拆分
        expect(errorLog).not.toMatch(/0:\s*"[A-Za-z]"/);
        expect(errorLog).not.toMatch(/1:\s*"[A-Za-z]"/);

        // 验证包含结构化信息
        expect(errorLog).toContain('err');
        expect(errorLog).toContain('type');
        expect(errorLog).toContain('message');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('事务服务日志格式', () => {
    it('应该正确处理事务错误日志', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await transactionService.runInTransaction(async (em) => {
          throw new Error('事务测试错误');
        });
      } catch (error) {
        // 忽略错误，我们只关心日志格式
      }

      // 等待日志输出
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalled();

      // 验证日志格式
      const logCalls = consoleSpy.mock.calls;
      const errorLogs = logCalls.filter(
        (call) =>
          call[0] &&
          typeof call[0] === 'string' &&
          call[0].includes('事务执行失败'),
      );

      if (errorLogs.length > 0) {
        const errorLog = errorLogs[0]?.[0];

        // 验证不包含字符拆分
        expect(errorLog).not.toMatch(/0:\s*"[A-Za-z]"/);
        expect(errorLog).not.toMatch(/1:\s*"[A-Za-z]"/);

        // 验证包含结构化信息
        expect(errorLog).toContain('transactionId');
        expect(errorLog).toContain('duration');
        expect(errorLog).toContain('err');
        expect(errorLog).toContain('type');
        expect(errorLog).toContain('message');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('性能日志格式', () => {
    it('应该保持性能日志的原有格式', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await app.getHttpAdapter().getInstance().inject({
        method: 'GET',
        url: '/',
      });

      // 等待日志输出
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalled();

      // 验证性能日志格式
      const logCalls = consoleSpy.mock.calls;
      const performanceLogs = logCalls.filter(
        (call) =>
          call[0] &&
          typeof call[0] === 'string' &&
          call[0].includes('performance'),
      );

      if (performanceLogs.length > 0) {
        const perfLog = performanceLogs[0]?.[0];

        // 验证性能日志包含必要字段
        expect(perfLog).toContain('type');
        expect(perfLog).toContain('method');
        expect(perfLog).toContain('url');
        expect(perfLog).toContain('statusCode');
        expect(perfLog).toContain('duration');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('日志序列化验证', () => {
    it('应该确保所有错误日志都使用结构化格式', () => {
      const testCases = [
        { method: 'log', message: '测试信息' },
        { method: 'error', message: new Error('测试错误') },
        { method: 'warn', message: '测试警告' },
        { method: 'debug', message: '测试调试' },
        { method: 'verbose', message: '测试详细' },
      ];

      testCases.forEach(({ method, message }) => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        (logger as any)[method](message, { testContext: 'test' });

        expect(consoleSpy).toHaveBeenCalled();
        const logOutput = consoleSpy.mock.calls[0]?.[0];

        // 验证不包含字符拆分
        expect(logOutput).not.toMatch(/0:\s*"[A-Za-z]"/);
        expect(logOutput).not.toMatch(/1:\s*"[A-Za-z]"/);

        // 验证包含上下文信息
        expect(logOutput).toContain('testContext');
        expect(logOutput).toContain('test');

        consoleSpy.mockRestore();
      });
    });
  });
});
