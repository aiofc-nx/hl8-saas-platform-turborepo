/**
 * Jest 测试设置
 */

// 设置全局测试环境
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // 清理测试环境
});

// 全局测试工具
global.console = {
  ...console,
  // 在测试中静默 console 输出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
