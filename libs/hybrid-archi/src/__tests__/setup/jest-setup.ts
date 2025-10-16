/**
 * Jest 测试环境设置
 *
 * 在测试环境初始化后、测试运行前执行
 * 用于设置全局测试配置和模拟
 */

// 设置测试环境变量
process.env.NODE_ENV = "test";

// 全局测试超时设置
// jest.setTimeout(30000); // 在ESM模块中不可用，已在jest.config.ts中设置

// 模拟 console 方法以避免测试输出干扰
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // 保留错误和警告，但静音其他输出
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// 清理模拟
afterAll(() => {
  global.console = originalConsole;
});

// 在ESM环境中，需要显式导入Jest函数以确保全局可用
import { jest, expect, describe, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// 将Jest函数挂载到全局对象上
(global as any).jest = jest;
(global as any).expect = expect;
(global as any).describe = describe;
(global as any).it = it;
(global as any).beforeEach = beforeEach;
(global as any).afterEach = afterEach;
(global as any).beforeAll = beforeAll;
(global as any).afterAll = afterAll;
