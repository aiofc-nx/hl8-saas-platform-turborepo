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

// 确保Jest全局对象可用
declare global {
  const jest: typeof import('jest');
  const describe: typeof import('jest').describe;
  const it: typeof import('jest').it;
  const test: typeof import('jest').test;
  const expect: typeof import('jest').expect;
  const beforeEach: typeof import('jest').beforeEach;
  const afterEach: typeof import('jest').afterEach;
  const beforeAll: typeof import('jest').beforeAll;
  const afterAll: typeof import('jest').afterAll;
}
