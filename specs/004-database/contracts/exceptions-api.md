# Exceptions API Contract: Database 异常类定义

**Feature**: 004-database | **Date**: 2025-10-13  
**Purpose**: 定义 database 模块的所有异常类型及其契约

---

## 基类

所有 database 异常都继承自 `AbstractHttpException`（来自 @hl8/exceptions）

```typescript
import { AbstractHttpException } from "@hl8/exceptions";
```

**基类构造函数签名**：

```typescript
constructor(
  errorCode: string,    // 错误代码（大写蛇形）
  title: string,        // 简短标题（中文）
  detail: string,       // 详细说明（中文）
  status: number,       // HTTP 状态码
  data?: any            // 附加数据（可选，不含敏感信息）
)
```

---

## 异常类定义

### 1. DatabaseConnectionException

**HTTP 状态码**: 503 Service Unavailable

**错误代码**: `DATABASE_CONNECTION_ERROR`

**用途**: 数据库连接失败时抛出

**构造函数**：

```typescript
constructor(detail: string, data?: Record<string, any>)
```

**参数**：

- `detail`: 详细错误说明（中文）
- `data`: 诊断信息（可选），如 { host, port, database }

**使用示例**：

```typescript
try {
  await this.orm.connect();
} catch (error) {
  this.logger.error("数据库连接失败", error.stack);

  throw new DatabaseConnectionException(
    "无法连接到数据库服务器，请检查数据库配置和网络连接",
    {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      // 不包含 username、password
    },
  );
}
```

**RFC7807 响应示例**：

```json
{
  "type": "https://docs.hl8.com/errors#DATABASE_CONNECTION_ERROR",
  "title": "数据库连接错误",
  "detail": "无法连接到数据库服务器，请检查数据库配置和网络连接",
  "status": 503,
  "errorCode": "DATABASE_CONNECTION_ERROR",
  "instance": "req-abc-123",
  "data": {
    "host": "localhost",
    "port": 5432,
    "database": "hl8_saas"
  }
}
```

---

### 2. DatabaseQueryException

**HTTP 状态码**: 500 Internal Server Error

**错误代码**: `DATABASE_QUERY_ERROR`

**用途**: 数据库查询执行失败时抛出

**构造函数**：

```typescript
constructor(detail: string, data?: Record<string, any>)
```

**参数**：

- `detail`: 详细错误说明（中文）
- `data`: 诊断信息（可选），如 { query（脱敏）, operation }

**使用示例**：

```typescript
async findUsers(filter: FilterQuery<User>): Promise<User[]> {
  try {
    return await this.em.find(User, filter);
  } catch (error) {
    this.logger.error('查询用户失败', error.stack);

    throw new DatabaseQueryException(
      '查询用户数据失败',
      {
        operation: 'findUsers',
        // 不包含敏感的过滤条件
      }
    );
  }
}
```

**RFC7807 响应示例**：

```json
{
  "type": "https://docs.hl8.com/errors#DATABASE_QUERY_ERROR",
  "title": "数据库查询错误",
  "detail": "查询用户数据失败",
  "status": 500,
  "errorCode": "DATABASE_QUERY_ERROR",
  "instance": "req-xyz-456",
  "data": {
    "operation": "findUsers"
  }
}
```

---

### 3. DatabaseTransactionException

**HTTP 状态码**: 500 Internal Server Error

**错误代码**: `DATABASE_TRANSACTION_ERROR`

**用途**: 事务执行失败时抛出

**构造函数**：

```typescript
constructor(detail: string, data?: Record<string, any>)
```

**参数**：

- `detail`: 详细错误说明（中文）
- `data`: 诊断信息（可选），如 { operation, step }

**使用示例**：

```typescript
@Transactional()
async createUserWithProfile(userData: UserData): Promise<User> {
  try {
    const user = new User(userData);
    await this.em.persistAndFlush(user);

    const profile = new Profile(user.id);
    await this.em.persistAndFlush(profile);

    return user;
  } catch (error) {
    this.logger.error('创建用户事务失败', error.stack);

    throw new DatabaseTransactionException(
      '创建用户及其档案失败，所有操作已回滚',
      {
        operation: 'createUserWithProfile',
      }
    );
  }
}
```

**RFC7807 响应示例**：

```json
{
  "type": "https://docs.hl8.com/errors#DATABASE_TRANSACTION_ERROR",
  "title": "数据库事务错误",
  "detail": "创建用户及其档案失败，所有操作已回滚",
  "status": 500,
  "errorCode": "DATABASE_TRANSACTION_ERROR",
  "instance": "req-def-789",
  "data": {
    "operation": "createUserWithProfile"
  }
}
```

---

### 4. IsolationContextMissingException

**HTTP 状态码**: 400 Bad Request

**错误代码**: `ISOLATION_CONTEXT_MISSING`

**用途**: 需要隔离上下文但未提供时抛出

**构造函数**：

```typescript
constructor(detail: string, data?: Record<string, any>)
```

**参数**：

- `detail`: 详细错误说明（中文）
- `data`: 诊断信息（可选），如 { requiredLevel }

**使用示例**：

```typescript
@IsolationAware(IsolationLevel.TENANT)
async findTenantData(): Promise<Data[]> {
  const context = this.isolationService.getContext();

  if (!context || !context.getTenantId()) {
    throw new IsolationContextMissingException(
      '租户级数据访问要求提供租户 ID',
      {
        requiredLevel: 'TENANT',
        providedContext: context ? 'incomplete' : 'missing',
      }
    );
  }

  return this.em.find(Data, { tenantId: context.getTenantId() });
}
```

**RFC7807 响应示例**：

```json
{
  "type": "https://docs.hl8.com/errors#ISOLATION_CONTEXT_MISSING",
  "title": "隔离上下文缺失",
  "detail": "租户级数据访问要求提供租户 ID",
  "status": 400,
  "errorCode": "ISOLATION_CONTEXT_MISSING",
  "instance": "req-ghi-012",
  "data": {
    "requiredLevel": "TENANT",
    "providedContext": "missing"
  }
}
```

---

## 异常类汇总

| 异常类                             | HTTP 状态 | 错误代码                   | 使用场景                     |
| ---------------------------------- | --------- | -------------------------- | ---------------------------- |
| `DatabaseConnectionException`      | 503       | DATABASE_CONNECTION_ERROR  | 连接失败、连接断开、连接超时 |
| `DatabaseQueryException`           | 500       | DATABASE_QUERY_ERROR       | 查询执行失败、SQL 错误       |
| `DatabaseTransactionException`     | 500       | DATABASE_TRANSACTION_ERROR | 事务提交失败、回滚失败       |
| `IsolationContextMissingException` | 400       | ISOLATION_CONTEXT_MISSING  | 缺少必需的隔离上下文         |

---

## 异常继承层次

```
AbstractHttpException (from @hl8/exceptions)
  │
  ├── DatabaseConnectionException
  ├── DatabaseQueryException
  ├── DatabaseTransactionException
  └── IsolationContextMissingException
```

---

## 异常使用约束

### 1. 必须记录日志

所有异常抛出前必须记录日志：

```typescript
// ✅ 正确
this.logger.error('数据库连接失败', error.stack);
throw new DatabaseConnectionException('...', { ... });

// ❌ 错误（没有日志）
throw new DatabaseConnectionException('...', { ... });
```

### 2. 不包含敏感信息

data 参数不应包含：

- ❌ 密码
- ❌ 密钥
- ❌ 完整的 SQL（可能包含敏感数据）
- ❌ 用户的私密信息

```typescript
// ✅ 正确
throw new DatabaseQueryException("查询失败", {
  operation: "findUsers",
  // 不包含实际的查询条件
});

// ❌ 错误（暴露了敏感 SQL）
throw new DatabaseQueryException("查询失败", {
  sql: "SELECT * FROM users WHERE email = 'sensitive@email.com'",
});
```

### 3. 使用中文消息

```typescript
// ✅ 正确
throw new DatabaseConnectionException(
  "无法连接到数据库服务器，请检查数据库配置和网络连接",
);

// ❌ 错误（使用英文）
throw new DatabaseConnectionException("Failed to connect to database server");
```

### 4. 提供有用的上下文

```typescript
// ✅ 正确（包含诊断信息）
throw new DatabaseConnectionException("数据库连接超时", {
  host: config.host,
  port: config.port,
  timeoutMs: 5000,
});

// ❌ 错误（信息不足）
throw new DatabaseConnectionException("连接失败");
```

---

## 与 @hl8/exceptions 的集成

### 模块配置

database 模块依赖于应用已经配置了 `ExceptionModule`：

```typescript
// app.module.ts
@Module({
  imports: [
    // 1. 配置异常模块（必需）
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
    }),

    // 2. 导入 database 模块
    DatabaseModule.forRootAsync({
      /* ... */
    }),
  ],
})
export class AppModule {}
```

### 自动处理

一旦配置了 `ExceptionModule`：

1. ✅ 所有 database 异常自动被全局过滤器捕获
2. ✅ 自动转换为 RFC7807 格式
3. ✅ 自动记录日志（4xx 为 warn，5xx 为 error）
4. ✅ 生产环境自动脱敏

**开发者无需手动处理这些异常的转换和日志记录！**

---

## 测试异常

### 单元测试示例

```typescript
// connection.manager.spec.ts
describe("ConnectionManager", () => {
  it("应该在连接失败时抛出 DatabaseConnectionException", async () => {
    // Arrange
    mockOrm.connect.mockRejectedValue(new Error("Connection refused"));

    // Act & Assert
    await expect(connectionManager.connect()).rejects.toThrow(
      DatabaseConnectionException,
    );
  });

  it("应该在异常中包含诊断信息", async () => {
    // Arrange
    mockOrm.connect.mockRejectedValue(new Error("Connection refused"));

    // Act & Assert
    try {
      await connectionManager.connect();
    } catch (error) {
      expect(error).toBeInstanceOf(DatabaseConnectionException);
      expect(error.getResponse()).toMatchObject({
        errorCode: "DATABASE_CONNECTION_ERROR",
        status: 503,
      });
      expect(error.getResponse().data).toHaveProperty("host");
      expect(error.getResponse().data).toHaveProperty("port");
    }
  });
});
```

---

## 错误代码注册表

建议在 database 模块中维护错误代码常量：

```typescript
// src/constants/error-codes.ts
export const DATABASE_ERROR_CODES = {
  CONNECTION_ERROR: "DATABASE_CONNECTION_ERROR",
  QUERY_ERROR: "DATABASE_QUERY_ERROR",
  TRANSACTION_ERROR: "DATABASE_TRANSACTION_ERROR",
  ISOLATION_CONTEXT_MISSING: "ISOLATION_CONTEXT_MISSING",
} as const;

export type DatabaseErrorCode =
  (typeof DATABASE_ERROR_CODES)[keyof typeof DATABASE_ERROR_CODES];
```

**用途**：

- 类型安全的错误代码引用
- 便于文档生成
- 便于错误统计和监控

---

## 异常处理最佳实践

### 1. 分层异常处理

```
连接层 -> DatabaseConnectionException
查询层 -> DatabaseQueryException
事务层 -> DatabaseTransactionException
隔离层 -> IsolationContextMissingException
```

### 2. 异常链追踪

```typescript
async connect(): Promise<void> {
  try {
    await this.orm.connect();
  } catch (error) {
    // 记录原始错误到日志
    this.logger.error('数据库连接失败', error.stack);

    // 抛出业务异常（不在 data 中包含原始错误）
    throw new DatabaseConnectionException(
      `连接到 ${this.config.host}:${this.config.port} 失败`,
      {
        host: this.config.host,
        port: this.config.port,
      }
    );
  }
}
```

### 3. 统一的错误响应

所有异常都通过 @hl8/exceptions 的全局过滤器处理，保证：

- ✅ 统一的 RFC7807 格式
- ✅ 统一的日志记录
- ✅ 统一的敏感信息过滤
- ✅ 统一的请求 ID 追踪

---

## 导出清单

database 模块应导出以下异常类：

```typescript
// src/exceptions/index.ts
export { DatabaseConnectionException } from "./database-connection.exception.js";
export { DatabaseQueryException } from "./database-query.exception.js";
export { DatabaseTransactionException } from "./database-transaction.exception.js";
export { IsolationContextMissingException } from "./isolation-context-missing.exception.js";

// 同时导出错误代码常量
export { DATABASE_ERROR_CODES } from "../constants/error-codes.js";
export type { DatabaseErrorCode } from "../constants/error-codes.js";

// 主 index.ts 重新导出
// src/index.ts
export * from "./exceptions/index.js";
```

---

## 与预定义异常的关系

### 可以复用的预定义异常

某些场景可以直接使用 @hl8/exceptions 提供的预定义异常：

```typescript
import {
  GeneralNotFoundException,
  GeneralBadRequestException,
  InvalidIsolationContextException,
  TenantNotFoundException,
} from "@hl8/exceptions";

// 示例：租户未找到
if (!tenant) {
  throw new TenantNotFoundException(tenantId); // 直接使用预定义异常
}

// 示例：隔离上下文无效
if (!context.getTenantId()) {
  throw new InvalidIsolationContextException("缺少租户 ID");
}
```

### Database 专用异常

只有数据库操作特定的异常才定义在 database 模块中：

- DatabaseConnectionException
- DatabaseQueryException
- DatabaseTransactionException

**原则**：能用预定义的就用预定义的，只在必要时创建专用异常。

---

## 契约版本

**版本**: 1.0.0  
**兼容性**: 向后兼容  
**破坏性变更**: 需要主版本升级

---

**完成时间**: 2025-10-13  
**依赖**: @hl8/exceptions ^0.1.0
