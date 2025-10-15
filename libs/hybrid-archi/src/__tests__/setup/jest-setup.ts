/**
 * Jest 测试环境设置
 *
 * 在测试环境初始化后、测试运行前执行
 * 用于设置全局测试配置和模拟
 */

// 设置测试环境变量
process.env.NODE_ENV = "test";

// 全局测试超时设置
jest.setTimeout(30000);

// 模拟 console 方法以避免测试输出干扰
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // 保留错误和警告，但静音其他输出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// 清理模拟
afterAll(() => {
  global.console = originalConsole;
});
