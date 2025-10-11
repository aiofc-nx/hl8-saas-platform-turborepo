/**
 * LoggerService 单元测试
 */

import { LoggerService } from './logger.service.js';

describe('LoggerService', () => {
  let service: LoggerService;

  describe('constructor', () => {
    it('应该创建新的 Pino 实例（使用选项）', () => {
      expect(() => {
        service = new LoggerService(undefined, {
          level: 'debug',
          prettyPrint: false, // 避免 pino-pretty 依赖
        });
      }).not.toThrow();
      
      expect(service).toBeInstanceOf(LoggerService);
    });

    it('应该复用外部 Pino 实例', () => {
      const externalLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as any;

      service = new LoggerService(undefined, externalLogger);
      
      // 验证使用外部实例
      service.log('test');
      expect(externalLogger.info).toHaveBeenCalled();
    });
  });

  describe('log methods', () => {
    beforeEach(() => {
      service = new LoggerService(undefined, { level: 'debug', prettyPrint: false });
    });

    it('log 方法应该不抛出错误', () => {
      expect(() => service.log('Test message', { key: 'value' })).not.toThrow();
    });

    it('error 方法应该不抛出错误', () => {
      expect(() => service.error('Error message', 'Stack', { error: 'details' })).not.toThrow();
    });

    it('warn 方法应该不抛出错误', () => {
      expect(() => service.warn('Warning', { key: 'value' })).not.toThrow();
    });

    it('debug 方法应该不抛出错误', () => {
      expect(() => service.debug('Debug', { key: 'value' })).not.toThrow();
    });
  });

  describe('getPinoLogger', () => {
    it('应该返回底层 Pino 实例', () => {
      service = new LoggerService(undefined, { level: 'info', prettyPrint: false });

      const logger = service.getPinoLogger();

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });
});

