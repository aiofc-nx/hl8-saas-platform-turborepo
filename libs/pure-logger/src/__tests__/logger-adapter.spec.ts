/**
 * 日志适配器测试
 */

import { 
  LoggerAdapterManager, 
  BaseLoggerAdapter, 
  loggerAdapterManager,
  LogLevel 
} from '../index.js';
import { ConsoleLogger } from '../implementations/console-logger.js';
import { NoOpLogger } from '../implementations/noop-logger.js';

// 测试适配器实现
class TestLoggerAdapter extends BaseLoggerAdapter {
  readonly name = 'test-adapter';
  readonly version = '1.0.0';
  private available = true;

  createLogger(level: LogLevel) {
    return new ConsoleLogger(level);
  }

  isAvailable(): boolean {
    return this.available;
  }

  setAvailable(available: boolean): void {
    this.available = available;
  }
}

describe('LoggerAdapterManager', () => {
  let manager: LoggerAdapterManager;
  let testAdapter: TestLoggerAdapter;

  beforeEach(() => {
    manager = new LoggerAdapterManager();
    testAdapter = new TestLoggerAdapter();
  });

  describe('适配器注册', () => {
    it('应该正确注册适配器', () => {
      manager.register('test', testAdapter, true);
      
      const adapter = manager.getAdapter('test');
      expect(adapter).toBe(testAdapter);
    });

    it('应该设置默认适配器', () => {
      manager.register('test', testAdapter, true);
      
      const defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBe(testAdapter);
    });

    it('应该获取所有可用适配器', () => {
      manager.register('test1', testAdapter);
      manager.register('test2', testAdapter);
      
      const availableAdapters = manager.getAvailableAdapters();
      expect(availableAdapters).toHaveLength(2);
    });
  });

  describe('适配器管理', () => {
    it('应该获取适配器信息', () => {
      manager.register('test', testAdapter);
      
      const infos = manager.getAdapterInfos();
      expect(infos).toHaveLength(1);
      expect(infos[0].name).toBe('test-adapter');
      expect(infos[0].version).toBe('1.0.0');
      expect(infos[0].available).toBe(true);
    });

    it('应该切换默认适配器', () => {
      const adapter2 = new TestLoggerAdapter();
      manager.register('test1', testAdapter, true);
      manager.register('test2', adapter2);
      
      manager.setDefault('test2');
      
      const defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBe(adapter2);
    });

    it('应该移除适配器', () => {
      manager.register('test', testAdapter, true);
      manager.unregister('test');
      
      const adapter = manager.getAdapter('test');
      expect(adapter).toBeUndefined();
    });

    it('应该清空所有适配器', () => {
      manager.register('test1', testAdapter);
      manager.register('test2', new TestLoggerAdapter());
      
      manager.clear();
      
      expect(manager.getAvailableAdapters()).toHaveLength(0);
      expect(manager.getAdapter()).toBeUndefined();
    });
  });

  describe('可用性检查', () => {
    it('应该只返回可用的适配器', () => {
      testAdapter.setAvailable(false);
      manager.register('test', testAdapter);
      
      const adapter = manager.getAdapter('test');
      expect(adapter).toBeUndefined();
    });

    it('应该自动切换默认适配器当当前不可用时', () => {
      const adapter2 = new TestLoggerAdapter();
      manager.register('test1', testAdapter, true);
      manager.register('test2', adapter2);
      
      testAdapter.setAvailable(false);
      
      const defaultAdapter = manager.getAdapter();
      expect(defaultAdapter).toBe(adapter2);
    });
  });
});

describe('BaseLoggerAdapter', () => {
  let adapter: TestLoggerAdapter;

  beforeEach(() => {
    adapter = new TestLoggerAdapter();
  });

  it('应该提供适配器信息', () => {
    const info = adapter.getInfo();
    
    expect(info.name).toBe('test-adapter');
    expect(info.version).toBe('1.0.0');
    expect(info.available).toBe(true);
  });

  it('应该创建日志器实例', () => {
    const logger = adapter.createLogger(LogLevel.INFO);
    
    expect(logger).toBeDefined();
    expect(logger.getLevel()).toBe(LogLevel.INFO);
  });
});

describe('全局适配器管理器', () => {
  beforeEach(() => {
    loggerAdapterManager.clear();
  });

  it('应该是单例实例', () => {
    const manager1 = new LoggerAdapterManager();
    const manager2 = new LoggerAdapterManager();
    
    expect(manager1).not.toBe(manager2);
    expect(loggerAdapterManager).toBe(loggerAdapterManager);
  });

  it('应该支持全局适配器注册', () => {
    const adapter = new TestLoggerAdapter();
    loggerAdapterManager.register('global-test', adapter, true);
    
    const retrievedAdapter = loggerAdapterManager.getAdapter('global-test');
    expect(retrievedAdapter).toBe(adapter);
  });
});
