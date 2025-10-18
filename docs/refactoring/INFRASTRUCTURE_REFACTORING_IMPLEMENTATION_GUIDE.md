# 基础设施层重构实施指南

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **状态**: 待执行

---

## 📋 目录

- [1. 快速开始](#1-快速开始)
- [2. 第一阶段：基础重构](#2-第一阶段基础重构)
- [3. 第二阶段：核心功能重构](#3-第二阶段核心功能重构)
- [4. 第三阶段：功能完善](#4-第三阶段功能完善)
- [5. 第四阶段：测试和优化](#5-第四阶段测试和优化)
- [6. 工具和资源](#6-工具和资源)

---

## 1. 快速开始

### 1.1 环境准备

#### 1.1.1 开发环境
```bash
# 检查Node.js版本
node --version  # 应该 >= 18.0.0

# 检查pnpm版本
pnpm --version  # 应该 >= 8.0.0

# 检查TypeScript版本
npx tsc --version  # 应该 >= 5.0.0
```

#### 1.1.2 项目设置
```bash
# 进入项目目录
cd /home/arligle/hl8/hl8-saas-platform-turborepo/libs/business-core

# 安装依赖
pnpm install

# 检查构建状态
pnpm build
```

### 1.2 重构检查清单

#### 1.2.1 当前状态检查
- [ ] 构建错误数量: ___ 个
- [ ] 测试通过率: ___%
- [ ] 代码覆盖率: ___%
- [ ] 主要功能状态: ___ (可用/不可用)

#### 1.2.2 目标状态
- [ ] 构建错误数量: 0 个
- [ ] 测试通过率: 100%
- [ ] 代码覆盖率: 80%+
- [ ] 主要功能状态: 全部可用

---

## 2. 第一阶段：基础重构

### 2.1 修复构建错误

#### 2.1.1 模块导入问题修复

**问题**: 大量模块导入错误
**解决方案**: 统一模块导入路径

```typescript
// 修复前
import { SomeService } from "./some-service.js"; // 文件不存在

// 修复后
import { SomeService } from "./some-service.ts"; // 使用正确路径
// 或者
// import { SomeService } from "./some-service"; // 移除.js扩展名
```

**实施步骤**:
1. 扫描所有导入错误
2. 检查文件是否存在
3. 修复导入路径
4. 验证构建成功

#### 2.1.2 类型定义不匹配修复

**问题**: 接口和实现不匹配
**解决方案**: 统一类型定义

```typescript
// 修复前
interface ILogger {
  debug(message: string, context?: any): void;
}

class LoggerAdapter implements ILogger {
  debug(message: string, context?: Record<string, unknown>): void {
    // 参数类型不匹配
  }
}

// 修复后
interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
}

class LoggerAdapter implements ILogger {
  debug(message: string, context?: Record<string, unknown>): void {
    // 类型匹配
  }
}
```

#### 2.1.3 缺失属性修复

**问题**: 访问不存在的属性
**解决方案**: 添加缺失属性或修复访问方式

```typescript
// 修复前
if (user.isActive) { // isActive属性不存在
  // ...
}

// 修复后
if (user.status === 'ACTIVE') { // 使用正确的属性
  // ...
}
```

### 2.2 简化应用模块

#### 2.2.1 移除不存在的服务

**当前问题**: 应用模块导入大量不存在的服务
**解决方案**: 只导入实际存在的服务

```typescript
// 修复前 - application.module.ts
import { DeleteTenantUseCase } from "./use-cases/tenant/delete-tenant.use-case.js"; // 不存在
import { GetTenantUseCase } from "./use-cases/tenant/get-tenant.use-case.js"; // 不存在

// 修复后
// 只导入实际存在的服务
import { CreateTenantUseCase } from "./use-cases/tenant/create-tenant.use-case.js";
import { UpdateTenantUseCase } from "./use-cases/tenant/update-tenant.use-case.js";
import { GetTenantsUseCase } from "./use-cases/tenant/get-tenants.use-case.js";
```

#### 2.2.2 简化依赖注入配置

**当前问题**: 依赖注入配置过于复杂
**解决方案**: 简化配置，只配置必要的服务

```typescript
// 修复前
providers: [
  // 大量复杂的依赖注入配置
  {
    provide: "ICreateUserUseCase",
    useFactory: (/* 复杂的参数 */) => new CreateUserUseCase(/* 复杂的依赖 */),
    inject: [/* 大量依赖 */],
  },
  // ... 更多复杂配置
]

// 修复后
providers: [
  // 简化的依赖注入配置
  {
    provide: "ICreateUserUseCase",
    useClass: CreateUserUseCase,
  },
  // ... 其他简化配置
]
```

### 2.3 统一错误处理

#### 2.3.1 创建统一异常类型

```typescript
// src/common/exceptions/infrastructure.exceptions.ts
export class InfrastructureException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'InfrastructureException';
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', context);
  }
}

export class CacheException extends InfrastructureException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CACHE_ERROR', context);
  }
}
```

#### 2.3.2 实现统一错误处理

```typescript
// src/common/error-handler.ts
export class ErrorHandler {
  static handle(error: unknown, context?: Record<string, unknown>): never {
    if (error instanceof InfrastructureException) {
      // 记录基础设施错误
      console.error('Infrastructure Error:', error.message, error.context);
      throw error;
    }
    
    if (error instanceof Error) {
      // 记录通用错误
      console.error('General Error:', error.message, context);
      throw new InfrastructureException(error.message, 'UNKNOWN_ERROR', context);
    }
    
    // 记录未知错误
    console.error('Unknown Error:', error, context);
    throw new InfrastructureException('Unknown error occurred', 'UNKNOWN_ERROR', context);
  }
}
```

### 2.4 建立测试框架

#### 2.4.1 配置测试环境

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### 2.4.2 编写基础测试用例

```typescript
// src/infrastructure/adapters/ports/logger-port.adapter.spec.ts
import { LoggerPortAdapter } from './logger-port.adapter';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';

describe('LoggerPortAdapter', () => {
  let adapter: LoggerPortAdapter;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    adapter = new LoggerPortAdapter(mockLogger);
  });

  it('should log debug message', () => {
    adapter.debug('test message', { key: 'value' });
    expect(mockLogger.debug).toHaveBeenCalledWith('test message', { key: 'value' });
  });

  it('should log info message', () => {
    adapter.info('test message', { key: 'value' });
    expect(mockLogger.info).toHaveBeenCalledWith('test message', { key: 'value' });
  });
});
```

---

## 3. 第二阶段：核心功能重构

### 3.1 重构事件存储实现

#### 3.1.1 简化事件存储接口

```typescript
// src/domain/ports/event-store.port.ts
export interface IEventStore {
  saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getEventsByType(eventType: string, fromDate?: Date): Promise<DomainEvent[]>;
  getEventsByTenant(tenantId: string, fromDate?: Date): Promise<DomainEvent[]>;
}
```

#### 3.1.2 实现简化的事件存储

```typescript
// src/infrastructure/event-sourcing/postgresql/event-store.implementation.ts
export class EventStoreImplementation implements IEventStore {
  constructor(
    private readonly database: DatabaseService,
    private readonly logger: ILogger
  ) {}

  async saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void> {
    try {
      const eventData = events.map(event => ({
        aggregateId,
        eventType: event.constructor.name,
        eventData: JSON.stringify(event),
        eventVersion: event.version,
        occurredAt: event.occurredAt,
        tenantId: event.tenantId,
      }));

      await this.database.insert('events', eventData);
      
      this.logger.info('Events saved successfully', { aggregateId, eventCount: events.length });
    } catch (error) {
      this.logger.error('Failed to save events', error, { aggregateId });
      throw new DatabaseException('Failed to save events', { aggregateId, error });
    }
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    try {
      const query = this.database
        .select('*')
        .from('events')
        .where('aggregateId', aggregateId)
        .orderBy('eventVersion', 'asc');

      if (fromVersion !== undefined) {
        query.where('eventVersion', '>', fromVersion);
      }

      const rows = await query;
      
      return rows.map(row => this.deserializeEvent(row));
    } catch (error) {
      this.logger.error('Failed to get events', error, { aggregateId });
      throw new DatabaseException('Failed to get events', { aggregateId, error });
    }
  }

  private deserializeEvent(row: any): DomainEvent {
    // 实现事件反序列化逻辑
    const eventData = JSON.parse(row.eventData);
    // 根据事件类型创建相应的事件对象
    return eventData;
  }
}
```

### 3.2 完善事件驱动架构

#### 3.2.1 实现简化的事件总线

```typescript
// src/infrastructure/event-driven/event-bus.implementation.ts
export class EventBusImplementation implements IEventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(private readonly logger: ILogger) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      const eventType = event.constructor.name;
      const handlers = this.handlers.get(eventType) || [];
      
      for (const handler of handlers) {
        try {
          await handler.handle(event);
        } catch (error) {
          this.logger.error('Event handler failed', error, { eventType, handler: handler.constructor.name });
          // 继续处理其他处理器
        }
      }
      
      this.logger.info('Event published successfully', { eventType });
    } catch (error) {
      this.logger.error('Failed to publish event', error, { eventType: event.constructor.name });
      throw new EventBusException('Failed to publish event', { event, error });
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
}
```

#### 3.2.2 实现死信队列

```typescript
// src/infrastructure/event-driven/dead-letter-queue.implementation.ts
export class DeadLetterQueueImplementation {
  private readonly failedEvents = new Map<string, FailedEvent>();

  constructor(
    private readonly logger: ILogger,
    private readonly config: DeadLetterQueueConfig
  ) {}

  async handleFailedEvent(event: DomainEvent, error: Error, retryCount: number): Promise<void> {
    const eventId = this.generateEventId(event);
    
    if (retryCount >= this.config.maxRetries) {
      await this.moveToDeadLetter(event, error, retryCount);
    } else {
      await this.scheduleRetry(event, error, retryCount);
    }
  }

  private async moveToDeadLetter(event: DomainEvent, error: Error, retryCount: number): Promise<void> {
    const failedEvent: FailedEvent = {
      id: this.generateEventId(event),
      event,
      error: error.message,
      retryCount,
      failedAt: new Date(),
      status: 'dead_letter',
    };

    this.failedEvents.set(failedEvent.id, failedEvent);
    
    this.logger.error('Event moved to dead letter queue', error, {
      eventId: failedEvent.id,
      retryCount,
    });
  }

  private async scheduleRetry(event: DomainEvent, error: Error, retryCount: number): Promise<void> {
    const delay = this.calculateRetryDelay(retryCount);
    
    setTimeout(async () => {
      try {
        await this.retryEvent(event, retryCount + 1);
      } catch (retryError) {
        await this.handleFailedEvent(event, retryError, retryCount + 1);
      }
    }, delay);
  }
}
```

### 3.3 实现多租户支持

#### 3.3.1 数据隔离实现

```typescript
// src/infrastructure/multi-tenant/data-isolation.service.ts
export class DataIsolationService {
  constructor(private readonly database: DatabaseService) {}

  async executeWithTenant<T>(tenantId: string, operation: () => Promise<T>): Promise<T> {
    // 设置租户上下文
    this.database.setTenantContext(tenantId);
    
    try {
      return await operation();
    } finally {
      // 清理租户上下文
      this.database.clearTenantContext();
    }
  }

  async queryWithTenant<T>(tenantId: string, query: QueryBuilder): Promise<T[]> {
    // 自动添加租户过滤条件
    query.where('tenantId', tenantId);
    return await query.execute();
  }
}
```

#### 3.3.2 缓存隔离实现

```typescript
// src/infrastructure/multi-tenant/cache-isolation.service.ts
export class CacheIsolationService {
  constructor(private readonly cache: CacheService) {}

  private getTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  async get<T>(tenantId: string, key: string): Promise<T | null> {
    const tenantKey = this.getTenantKey(tenantId, key);
    return await this.cache.get<T>(tenantKey);
  }

  async set<T>(tenantId: string, key: string, value: T, ttl?: number): Promise<void> {
    const tenantKey = this.getTenantKey(tenantId, key);
    await this.cache.set(tenantKey, value, ttl);
  }

  async delete(tenantId: string, key: string): Promise<void> {
    const tenantKey = this.getTenantKey(tenantId, key);
    await this.cache.delete(tenantKey);
  }
}
```

---

## 4. 第三阶段：功能完善

### 4.1 完善消息队列实现

#### 4.1.1 实现消息队列适配器

```typescript
// src/infrastructure/adapters/message-queue/message-queue.adapter.ts
export class MessageQueueAdapter implements IMessageQueue {
  constructor(
    private readonly connection: MessageQueueConnection,
    private readonly logger: ILogger
  ) {}

  async publish(queueName: string, message: any): Promise<void> {
    try {
      await this.connection.publish(queueName, JSON.stringify(message));
      this.logger.info('Message published', { queueName });
    } catch (error) {
      this.logger.error('Failed to publish message', error, { queueName });
      throw new MessageQueueException('Failed to publish message', { queueName, error });
    }
  }

  async subscribe(queueName: string, handler: MessageHandler): Promise<void> {
    try {
      await this.connection.subscribe(queueName, async (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          await handler.handle(parsedMessage);
        } catch (error) {
          this.logger.error('Message handler failed', error, { queueName });
          // 处理失败的消息
        }
      });
      
      this.logger.info('Message subscription created', { queueName });
    } catch (error) {
      this.logger.error('Failed to subscribe to queue', error, { queueName });
      throw new MessageQueueException('Failed to subscribe to queue', { queueName, error });
    }
  }
}
```

### 4.2 实现监控统计功能

#### 4.2.1 性能监控实现

```typescript
// src/infrastructure/monitoring/performance-monitor.service.ts
export class PerformanceMonitorService {
  private readonly metrics = new Map<string, Metric>();

  constructor(private readonly logger: ILogger) {}

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      tags: tags || {},
      timestamp: new Date(),
    };

    this.metrics.set(name, metric);
    
    // 发送到监控系统
    this.sendToMonitoringSystem(metric);
  }

  recordExecutionTime(operation: string, duration: number): void {
    this.recordMetric('execution_time', duration, { operation });
  }

  recordMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    this.recordMetric('memory_usage', memoryUsage.heapUsed, { type: 'heap_used' });
    this.recordMetric('memory_usage', memoryUsage.heapTotal, { type: 'heap_total' });
  }

  private sendToMonitoringSystem(metric: Metric): void {
    // 实现发送到监控系统的逻辑
    this.logger.debug('Metric recorded', { metric });
  }
}
```

### 4.3 性能优化

#### 4.3.1 数据库查询优化

```typescript
// src/infrastructure/optimization/database-optimizer.service.ts
export class DatabaseOptimizerService {
  constructor(private readonly database: DatabaseService) {}

  async optimizeQuery(query: QueryBuilder): Promise<QueryBuilder> {
    // 添加索引提示
    query.hint('use_index');
    
    // 限制结果集大小
    query.limit(1000);
    
    // 添加查询缓存
    query.cache(true);
    
    return query;
  }

  async createIndexes(): Promise<void> {
    const indexes = [
      { table: 'events', columns: ['aggregateId', 'eventVersion'] },
      { table: 'events', columns: ['tenantId', 'occurredAt'] },
      { table: 'events', columns: ['eventType', 'occurredAt'] },
    ];

    for (const index of indexes) {
      await this.database.createIndex(index.table, index.columns);
    }
  }
}
```

---

## 5. 第四阶段：测试和优化

### 5.1 全面测试验证

#### 5.1.1 单元测试

```typescript
// src/infrastructure/adapters/ports/logger-port.adapter.spec.ts
describe('LoggerPortAdapter', () => {
  let adapter: LoggerPortAdapter;
  let mockLogger: jest.Mocked<FastifyLoggerService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    adapter = new LoggerPortAdapter(mockLogger);
  });

  describe('debug', () => {
    it('should log debug message', () => {
      adapter.debug('test message', { key: 'value' });
      expect(mockLogger.debug).toHaveBeenCalledWith('test message', { key: 'value' });
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      adapter.info('test message', { key: 'value' });
      expect(mockLogger.info).toHaveBeenCalledWith('test message', { key: 'value' });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      adapter.warn('test message', { key: 'value' });
      expect(mockLogger.warn).toHaveBeenCalledWith('test message', { key: 'value' });
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      const error = new Error('test error');
      adapter.error('test message', error, { key: 'value' });
      expect(mockLogger.error).toHaveBeenCalledWith('test message', error, { key: 'value' });
    });
  });
});
```

#### 5.1.2 集成测试

```typescript
// src/infrastructure/integration/event-store.integration.spec.ts
describe('EventStore Integration', () => {
  let eventStore: IEventStore;
  let database: DatabaseService;

  beforeEach(async () => {
    database = await createTestDatabase();
    eventStore = new EventStoreImplementation(database, createMockLogger());
  });

  afterEach(async () => {
    await database.close();
  });

  it('should save and retrieve events', async () => {
    const aggregateId = 'test-aggregate-1';
    const events = [
      new UserCreatedEvent('user-1', 'test@example.com'),
      new UserUpdatedEvent('user-1', { name: 'Updated Name' }),
    ];

    await eventStore.saveEvents(aggregateId, events);
    
    const retrievedEvents = await eventStore.getEvents(aggregateId);
    
    expect(retrievedEvents).toHaveLength(2);
    expect(retrievedEvents[0]).toBeInstanceOf(UserCreatedEvent);
    expect(retrievedEvents[1]).toBeInstanceOf(UserUpdatedEvent);
  });
});
```

### 5.2 性能测试

#### 5.2.1 负载测试

```typescript
// tests/performance/load-test.spec.ts
describe('Load Test', () => {
  it('should handle 1000 concurrent requests', async () => {
    const requests = Array.from({ length: 1000 }, (_, i) => 
      createUser({ email: `user${i}@example.com` })
    );

    const startTime = Date.now();
    const results = await Promise.allSettled(requests);
    const endTime = Date.now();

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const duration = endTime - startTime;

    expect(successCount).toBe(1000);
    expect(duration).toBeLessThan(5000); // 5秒内完成
  });
});
```

#### 5.2.2 内存测试

```typescript
// tests/performance/memory-test.spec.ts
describe('Memory Test', () => {
  it('should not leak memory', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 执行大量操作
    for (let i = 0; i < 10000; i++) {
      await createUser({ email: `user${i}@example.com` });
    }
    
    // 强制垃圾回收
    global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
  });
});
```

---

## 6. 工具和资源

### 6.1 开发工具

#### 6.1.1 代码质量工具
```bash
# ESLint配置
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier配置
npm install --save-dev prettier

# Husky配置
npm install --save-dev husky lint-staged
```

#### 6.1.2 测试工具
```bash
# Jest配置
npm install --save-dev jest @types/jest ts-jest

# 测试覆盖率
npm install --save-dev @jest/coverage
```

### 6.2 监控工具

#### 6.2.1 性能监控
```bash
# 性能监控
npm install --save-dev clinic

# 内存分析
npm install --save-dev heapdump
```

#### 6.2.2 日志工具
```bash
# 结构化日志
npm install pino pino-pretty

# 日志传输
npm install pino-elasticsearch
```

### 6.3 部署工具

#### 6.3.1 容器化
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 6.3.2 健康检查
```typescript
// src/health/health-check.service.ts
export class HealthCheckService {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkMessageQueue(),
    ]);

    const status = checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy';
    
    return {
      status,
      timestamp: new Date(),
      checks: checks.map((check, index) => ({
        name: ['database', 'cache', 'messageQueue'][index],
        status: check.status,
        details: check.status === 'fulfilled' ? check.value : check.reason,
      })),
    };
  }
}
```

---

## 7. 总结

### 7.1 重构成果

通过四个阶段的重构，预期达到以下成果：

- **代码质量**: 代码质量显著提升，构建成功，测试覆盖率达到80%+
- **功能完整**: 所有核心功能完整可用，事件存储、事件驱动、多租户支持完善
- **性能优化**: 系统性能显著提升，响应时间小于100ms，支持1000+并发用户
- **团队能力**: 团队技术能力显著提升，代码质量意识增强

### 7.2 持续改进

重构完成后，建议建立持续改进机制：

- **代码审查**: 建立代码审查流程，确保代码质量
- **性能监控**: 建立性能监控体系，持续优化性能
- **技术分享**: 定期进行技术分享，提升团队能力
- **文档更新**: 持续更新技术文档，保持文档同步

### 7.3 成功标准

重构成功的标准：

- **技术标准**: 构建成功，测试通过，代码覆盖率达标
- **功能标准**: 所有功能可用，性能指标满足要求
- **团队标准**: 团队技术能力提升，协作效率提高
- **业务标准**: 支持业务发展，提升用户体验

---

**文档状态**: 待执行 | **最后更新**: 2025-01-27 | **版本**: 1.0.0
