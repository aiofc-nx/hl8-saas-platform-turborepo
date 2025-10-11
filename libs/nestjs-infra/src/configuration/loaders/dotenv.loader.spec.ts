/**
 * DotenvLoader 单元测试
 */

import { DotenvLoader, dotenvLoader } from './dotenv.loader.js';
import { config } from 'dotenv';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('DotenvLoader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 process.env
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('load', () => {
    it('应该返回 process.env', () => {
      process.env.TEST_VAR = 'test-value';

      const loader = new DotenvLoader();
      const result = loader.load();

      expect(result).toBe(process.env);
      expect(result.TEST_VAR).toBe('test-value');
    });

    it('应该调用 dotenv.config 加载指定文件', () => {
      const loader = new DotenvLoader({ path: '.env.test' });
      loader.load();

      expect(config).toHaveBeenCalledWith({ path: '.env.test' });
    });

    it('未指定路径时不应调用 dotenv.config', () => {
      const loader = new DotenvLoader();
      loader.load();

      expect(config).not.toHaveBeenCalled();
    });
  });

  describe('dotenvLoader helper', () => {
    it('应该创建 DotenvLoader 实例', () => {
      const loader = dotenvLoader({ path: '.env.test' });

      expect(loader).toBeInstanceOf(DotenvLoader);
    });

    it('应该支持无参数调用', () => {
      const loader = dotenvLoader();

      expect(loader).toBeInstanceOf(DotenvLoader);
    });
  });
});

