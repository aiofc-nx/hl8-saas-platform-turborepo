### 日志序列化问题记录（Fastify + Pino + NestJS）

#### 背景

- 项目：`apps/fastify-api`（NestJS on Fastify，ORM：MikroORM）
- 日志：`pino` + 自研 `FastifyLoggerService`，并配套全局异常过滤器与企业级适配器。
- 现象：错误日志被序列化为逐字符数组（如 0:"D" 1:"a" ...），可读性极差。

#### 症状与复现

- 访问 `POST /users`（触发异常）后，控制台出现“字符拆分”的错误输出。
- 典型日志（问题前）：

```text
ERROR: Unhandled Exception: 服务器内部错误
0: "D"
1: "a"
2: "t"
...
```

#### 影响范围

- 运行环境：开发环境与生产环境均可能受影响。
- 受影响模块：
  - `libs/nestjs-fastify`: 自定义日志服务与异常过滤器
  - `apps/fastify-api`: Fastify/Pino 启动日志配置
  - `libs/database`: 事务服务错误日志

#### 根因分析

1. 在日志调用处直接将 `Error` 或 `stack` 作为 logger 的第二参数传入，导致 Pino 将其视作“message”字符串进行逐字符序列化。
2. Pino 序列化器（serializers）未统一配置 Error 对象的结构化输出。
3. 异常过滤器向 Logger 传参方式与 `FastifyLoggerService` 的函数签名不匹配（第二参数期望字符串），造成 TS 报错并影响统一结构化策略。

#### 修复方案

1. 统一 Error 对象结构化：在所有调用点将 `Error` 转换为 `{ type, message, stack }` 并置于 `context.err`。
2. 在 Fastify/Pino 启动配置中添加 `serializers` 以保证底层输出一致。
3. 校正异常过滤器对 `logger.error` 的参数调用顺序，使其与 `FastifyLoggerService` 的签名一致（第二参占位传 `undefined`，上下文透传第三参）。

#### 具体修改

- 统一结构化 `Error`（示例）：

```ts
// 将以前的：
this.logger.error('事务执行失败，已回滚', (error as Error).stack, {
  transactionId,
  duration,
});

// 改为：
this.logger.error('事务执行失败，已回滚', {
  transactionId,
  duration,
  err:
    error instanceof Error
      ? {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined,
});
```

- Fastify/Pino 启动配置添加 serializers（开发与生产）：

```ts
// apps/fastify-api/src/main.ts（节选）
logger: {
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } } : undefined,
  serializers: {
    err: (err: Error) => ({ type: err.constructor.name, message: err.message, stack: err.stack }),
    req: (req: any) => ({ method: req.method, url: req.url, headers: req.headers }),
    res: (res: any) => ({ statusCode: res.statusCode }),
  },
},
```

- 异常过滤器修正 `logger.error` 参数顺序（第二参为 message，占位传 `undefined`）：

```ts
// libs/nestjs-fastify/src/exceptions/filters/fastify-any-exception.filter.ts（节选）
this.logger.error(logMessage, undefined, {
  errorCode,
  detail: this.getDetailedError(exception),
  url: request.url,
  method: request.method,
  err:
    exception instanceof Error
      ? {
          type: exception.constructor.name,
          message: exception.message,
          stack: exception.stack,
        }
      : undefined,
});

// libs/nestjs-fastify/src/exceptions/filters/fastify-http-exception.filter.ts（节选）
this.logger.error(logMessage, undefined, {
  ...logContext,
  err: {
    type: exception.constructor.name,
    message: exception.message,
    stack: exception.stack,
  },
});
```

#### 受影响与修改文件（关键）

- `libs/nestjs-fastify/src/logging/fastify-logger.service.ts`
- `libs/nestjs-fastify/src/exceptions/filters/fastify-any-exception.filter.ts`
- `libs/nestjs-fastify/src/exceptions/filters/fastify-http-exception.filter.ts`
- `libs/nestjs-fastify/src/config/fastify.config.ts`
- `apps/fastify-api/src/main.ts`
- `libs/database/src/transaction/transaction.service.ts`

#### 验证步骤

1. 启动 `apps/fastify-api`：`pnpm --filter fastify-api start:dev`
2. 访问健康检查：`curl http://localhost:3001/`
3. 触发错误：`curl -X POST http://localhost:3001/users -H 'Content-Type: application/json' -d '{"name":"test","email":"test@example.com"}'`
4. 期望日志：
   - 不再出现逐字符拆分
   - 错误以结构化形式输出：`err: { type, message, stack }`
   - 性能日志与请求结束日志保持原有格式

#### 最终效果（修复后示例）

```text
ERROR: 事务执行失败，已回滚
  transactionId: "<uuid>"
  duration: 7
  err: { "type": "Object", "message": "...", "stack": "..." }

ERROR: Unhandled Exception: 服务器内部错误
INFO:  type: "performance" method: "POST" url: "/users" statusCode: 500 duration: 8
```

#### 经验教训

- Pino 的第二参数是 message（字符串）而非 context，将 `Error` 或 `stack` 直接作为第二参传入会造成非预期序列化。
- 需要统一在调用点和底层 logger 层同时处理 Error 序列化：调用点构造 `context.err`，底层配置 `serializers.err`。
- 异常过滤器应与自定义 Logger 的方法签名严格对齐，避免类型错配导致的隐性问题。

#### 后续改进（已完成）

✅ **类型约束改进**：

- 为 `FastifyLoggerService` 添加了严格的类型定义（`LogContext`、`ErrorObject`、`EnrichedLogContext`）
- 更新了方法签名以匹配 `ILoggerService` 接口
- 修复了异常过滤器中的类型错误

✅ **Pino 配置工厂**：

- 创建了 `pino-config.factory.ts` 提供统一的 Pino 配置
- 支持开发环境和生产环境的不同配置
- 更新了 `fastify.config.ts` 和 `main.ts` 使用新的配置工厂
- 避免了多处散落配置的问题

✅ **回归测试**：

- 创建了 `logging-format.e2e-spec.ts` 端到端测试
- 创建了 `pino-config.factory.spec.ts` 单元测试
- 验证日志序列化格式正确性
- 防止字符拆分问题再次出现

#### 改进效果

1. **类型安全**：所有日志调用都有严格的类型约束
2. **配置统一**：Pino 配置通过工厂模式统一管理
3. **测试覆盖**：完整的回归测试确保问题不再重现
4. **代码质量**：更好的可维护性和可扩展性
