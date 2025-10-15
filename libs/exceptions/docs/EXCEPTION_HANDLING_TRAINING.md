# 异常处理培训文档

> HL8 SAAS 平台异常处理机制完整培训指南

---

## 📚 培训目标

完成本培训后，你将能够：

- ✅ 理解异常处理的原则和机制
- ✅ 掌握异常与过滤器的关系
- ✅ 正确定义新的异常类
- ✅ 根据环境输出适当的异常信息

---

## 📖 目录

- [第一部分：异常处理原则和机制](#第一部分异常处理原则和机制)
- [第二部分：异常与过滤器的关系](#第二部分异常与过滤器的关系)
- [第三部分：如何定义新的异常](#第三部分如何定义新的异常)
- [第四部分：根据环境输出异常信息](#第四部分根据环境输出异常信息)
- [实践练习](#实践练习)
- [总结和检查清单](#总结和检查清单)

---

## 第一部分：异常处理原则和机制

### 1.1 为什么需要统一的异常处理？

#### ❌ 没有统一异常处理的问题

```typescript
// 不同的开发者返回不同的错误格式
@Get('user/:id')
async getUser(@Param('id') id: string) {
  if (!user) {
    // 开发者A：返回简单字符串
    return { error: 'User not found' };

    // 开发者B：抛出普通错误
    throw new Error('User not found');

    // 开发者C：返回复杂对象
    return { success: false, message: 'User not found', code: 404 };
  }
}

// 客户端收到不一致的响应格式，难以处理
```

#### ✅ 统一异常处理的优势

```typescript
@Get('user/:id')
async getUser(@Param('id') id: string) {
  if (!user) {
    // 所有人都使用统一的异常类
    throw new GeneralNotFoundException(
      '用户未找到',
      `ID 为 "${id}" 的用户不存在`,
      { userId: id }
    );
  }
}

// 客户端总是收到一致的 RFC7807 格式
// {
//   "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
//   "title": "用户未找到",
//   "detail": "ID 为 \"123\" 的用户不存在",
//   "status": 404,
//   "errorCode": "USER_NOT_FOUND",
//   "data": { "userId": "123" }
// }
```

---

### 1.2 异常处理的核心原则

#### 原则1：统一的错误格式（RFC7807）

**RFC7807 标准定义了错误响应的标准格式**：

```json
{
  "type": "错误类型的URI",
  "title": "简短的错误标题",
  "detail": "详细的错误描述",
  "status": "HTTP状态码",
  "instance": "问题发生的URI"
}
```

**我们的扩展**：

```json
{
  "type": "https://docs.hl8.com/errors#ERROR_CODE",
  "title": "简短标题",
  "detail": "详细说明",
  "status": 404,
  "errorCode": "ERROR_CODE",
  "instance": "req-uuid-123",
  "data": { "额外的上下文数据" }
}
```

#### 原则2：异常分层

```
┌─────────────────────────────────────┐
│  业务异常（具体）                    │
│  OrderNotFoundException             │
│  ProductOutOfStockException         │
└──────────────┬──────────────────────┘
               │ 继承
┌──────────────┴──────────────────────┐
│  标准异常（通用）                    │
│  GeneralNotFoundException (404)     │
│  GeneralBadRequestException (400)   │
│  GeneralInternalServerException (500)│
└──────────────┬──────────────────────┘
               │ 继承
┌──────────────┴──────────────────────┐
│  异常基类                            │
│  AbstractHttpException              │
└─────────────────────────────────────┘
```

**分层的好处**：

- 标准异常：开箱即用，覆盖常见场景
- 业务异常：领域特定，语义明确
- 基类：统一行为，RFC7807 格式

#### 原则3：异常即文档

```typescript
// 好的异常就是好的文档
throw new GeneralNotFoundException(
  "用户未找到", // title - 简短说明
  `ID 为 "${userId}" 的用户不存在`, // detail - 详细描述
  { userId, searchedAt: new Date() }, // data - 上下文信息
);

// 前端开发者看到响应就知道：
// - 发生了什么（用户未找到）
// - 为什么发生（ID 不存在）
// - 相关数据（userId）
```

#### 原则4：早抛出，集中处理

```typescript
// ✅ 好的做法：在服务层早抛出
@Injectable()
export class UserService {
  async findById(id: string) {
    const user = await this.repo.findById(id);

    if (!user) {
      // 立即抛出异常
      throw new GeneralNotFoundException('用户未找到', ...);
    }

    return user;
  }
}

// ✅ 控制器不需要处理
@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string) {
    // 直接调用，异常会被全局过滤器处理
    return this.userService.findById(id);
  }
}

// ❌ 不好的做法：在控制器中处理
@Get(':id')
async getUser(@Param('id') id: string) {
  try {
    return this.userService.findById(id);
  } catch (error) {
    // 不要在控制器中捕获和转换异常
    return { error: error.message };
  }
}
```

---

### 1.3 异常处理机制

#### 完整的异常处理流程

```
1. 业务代码抛出异常
   throw new GeneralNotFoundException(...)
   ↓
2. NestJS 异常层捕获
   ↓
3. 异常过滤器处理
   ├─ HttpExceptionFilter（处理 AbstractHttpException）
   │  ├─ 转换为 RFC7807 格式
   │  ├─ 填充 instance（请求ID）
   │  ├─ 记录日志（4xx=warn, 5xx=error）
   │  └─ 返回响应
   │
   └─ AnyExceptionFilter（处理其他所有异常）
      ├─ 转换为 500 错误
      ├─ 生产环境脱敏
      └─ 记录完整错误
   ↓
4. 客户端收到统一的 RFC7807 响应
```

#### 代码中的体现

```typescript
// 步骤1：业务代码
async findUser(id: string) {
  const user = await this.repo.findById(id);
  if (!user) {
    throw new GeneralNotFoundException(...);  // 抛出
  }
  return user;
}

// 步骤2：NestJS 捕获
// 自动完成，无需编写代码

// 步骤3：过滤器处理
@Catch(AbstractHttpException)
export class HttpExceptionFilter {
  catch(exception: AbstractHttpException, host: ArgumentsHost) {
    // 转换为 RFC7807
    const problemDetails = exception.toProblemDetails();
    response.status(problemDetails.status).send(problemDetails);
  }
}

// 步骤4：客户端收到
// { "type": "...", "title": "...", "status": 404, ... }
```

---

### 1.4 异常处理的关键组件

#### 组件关系图

```
┌──────────────────────────────────────────────────────┐
│  ExceptionModule                                      │
│  ─────────────────────────────────────────────────   │
│  - 注册全局过滤器                                     │
│  - 提供消息提供器                                     │
│  - 提供配置选项                                       │
└───────────────────┬──────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ↓           ↓           ↓
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ 异常类   │ │ 过滤器   │ │ 消息提供器   │
│          │ │          │ │              │
│ Abstract │ │ Http     │ │ Default      │
│ HttpExc  │ │ Exc      │ │ Message      │
│          │ │ Filter   │ │ Provider     │
│          │ │          │ │              │
│ General  │ │ Any      │ │ Custom       │
│ NotFound │ │ Exc      │ │ Message      │
│          │ │ Filter   │ │ Provider     │
└──────────┘ └──────────┘ └──────────────┘
```

---

## 第二部分：异常与过滤器的关系

### 2.1 什么是异常过滤器？

**异常过滤器是 NestJS 的拦截器**，负责：

1. 捕获异常
2. 转换异常为响应格式
3. 记录日志
4. 发送响应给客户端

**类比**：

- 异常 = 信号弹（发出求救信号）
- 过滤器 = 消防队（接收信号并处理）

---

### 2.2 两个过滤器的分工

#### HttpExceptionFilter - HTTP异常专家

**职责**：处理所有继承自 `AbstractHttpException` 的异常

```typescript
@Catch(AbstractHttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AbstractHttpException, host: ArgumentsHost) {
    // 1. 获取 HTTP 响应对象
    const response = host.switchToHttp().getResponse();

    // 2. 转换为 RFC7807 格式
    const problemDetails = exception.toProblemDetails();

    // 3. 填充请求 ID
    problemDetails.instance = this.getRequestId(host);

    // 4. 记录日志
    if (problemDetails.status >= 500) {
      this.logger.error("HTTP 5xx Error", exception.stack);
    } else {
      this.logger.warn("HTTP 4xx Error", problemDetails);
    }

    // 5. 发送响应
    response.status(problemDetails.status).send(problemDetails);
  }
}
```

**处理的异常**：

- `GeneralNotFoundException` (404)
- `GeneralBadRequestException` (400)
- `GeneralInternalServerException` (500)
- 所有自定义的业务异常

#### AnyExceptionFilter - 兜底专家

**职责**：捕获所有其他未处理的异常

```typescript
@Catch() // 注意：没有指定类型，捕获所有
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    // 所有未知异常都转换为 500 错误
    const problemDetails = {
      type: "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
      title: "服务器内部错误",
      detail: this.isProduction
        ? "服务器发生错误，请稍后重试" // 生产：隐藏细节
        : exception.message, // 开发：显示详情
      status: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
    };

    // 记录完整错误
    this.logger.error("Unhandled Exception", exception.stack);

    response.status(500).send(problemDetails);
  }
}
```

**处理的异常**：

- JavaScript 原生错误（Error, TypeError, etc.）
- 第三方库抛出的异常
- 未预期的运行时错误
- 所有不是 `AbstractHttpException` 的异常

---

### 2.3 过滤器的执行顺序

#### 执行流程图

```
异常被抛出
  ↓
NestJS 异常层
  ↓
  检查异常类型
  ↓
  ├─> 是 AbstractHttpException？
  │   ├─ Yes → HttpExceptionFilter 处理
  │   │         ├─ 转换为 RFC7807
  │   │         ├─ 记录日志（4xx=warn, 5xx=error）
  │   │         └─ 发送响应
  │   │
  │   └─ No  → AnyExceptionFilter 处理
  │             ├─ 转换为 500 错误
  │             ├─ 生产环境脱敏
  │             ├─ 记录完整错误
  │             └─ 发送响应
  ↓
客户端收到响应
```

#### 代码示例

```typescript
// 场景1：抛出 AbstractHttpException
async findUser(id: string) {
  throw new GeneralNotFoundException(...);  // ← 继承自 AbstractHttpException
}
// → HttpExceptionFilter 处理

// 场景2：抛出普通 Error
async queryDatabase() {
  throw new Error('Database connection failed');  // ← 普通 Error
}
// → AnyExceptionFilter 处理

// 场景3：未捕获的异常
async calculate() {
  const result = null.toString();  // ← TypeError
}
// → AnyExceptionFilter 处理
```

---

### 2.4 过滤器的注册方式

#### 自动注册（推荐）

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      registerGlobalFilters: true, // ← 自动注册
    }),
  ],
})
export class AppModule {}

// 两个过滤器都会自动注册
// 不需要手动配置
```

#### 手动注册（不推荐）

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

app.useGlobalFilters(
  new HttpExceptionFilter(logger, messageProvider),
  new AnyExceptionFilter(logger, isProduction),
);
```

**推荐使用自动注册**：

- ✅ 简单方便
- ✅ 与模块配置统一
- ✅ 依赖注入友好

---

### 2.5 异常处理的数据流

```
┌─────────────┐
│  Service    │ throw new GeneralNotFoundException(...)
└──────┬──────┘
       │ 抛出异常
       ↓
┌─────────────┐
│  NestJS     │ 捕获异常
└──────┬──────┘
       │ 传递给过滤器
       ↓
┌─────────────┐
│  Filter     │ exception.toProblemDetails()
└──────┬──────┘
       │ 转换为 RFC7807
       ↓
┌─────────────┐
│  Logger     │ logger.warn/error(...)
└──────┬──────┘
       │ 记录日志
       ↓
┌─────────────┐
│  Response   │ response.status(404).send(problemDetails)
└──────┬──────┘
       │ 发送响应
       ↓
┌─────────────┐
│  Client     │ 收到 JSON 响应
└─────────────┘
```

---

## 第三部分：如何定义新的异常

### 3.1 何时需要自定义异常？

#### ✅ 需要自定义异常的场景

1. **领域特定的错误**

   ```typescript
   OrderNotFoundException;
   ProductOutOfStockException;
   PaymentFailedException;
   ```

2. **业务规则违反**

   ```typescript
   InsufficientBalanceException;
   DuplicateEmailException;
   InvalidOrderStateException;
   ```

3. **特定的错误信息**

   ```typescript
   // 而不是通用的 BadRequestException
   InvalidCouponCodeException;
   CouponExpiredException;
   ```

#### ❌ 不需要自定义异常的场景

1. **通用错误** - 使用标准异常

   ```typescript
   // ✅ 使用标准异常
   throw new GeneralNotFoundException('资源未找到', ...);

   // ❌ 不需要
   class GenericNotFoundException extends AbstractHttpException { }
   ```

2. **参数验证** - 使用 class-validator

   ```typescript
   // ✅ 使用 DTO 验证
   export class CreateUserDto {
     @IsEmail()
     email: string;
   }

   // ❌ 不需要
   class InvalidEmailException extends AbstractHttpException {}
   ```

---

### 3.2 定义新异常的步骤

#### 步骤1：确定异常特征

问自己以下问题：

1. **错误代码**：`ORDER_NOT_FOUND`
2. **HTTP 状态码**：404
3. **简短标题**：`订单未找到`
4. **谁会用到**：订单服务、订单控制器
5. **需要什么上下文数据**：`orderId`

#### 步骤2：创建异常类

````typescript
// libs/order/src/exceptions/order-not-found.exception.ts

import { AbstractHttpException } from "@hl8/exceptions";

/**
 * 订单未找到异常
 *
 * @description 当查询的订单不存在时抛出此异常
 *
 * ## 使用场景
 * - 根据订单ID查询订单时未找到
 * - 订单已被删除
 * - 订单ID格式错误
 *
 * @example
 * ```typescript
 * const order = await this.orderRepo.findById(orderId);
 * if (!order) {
 *   throw new OrderNotFoundException(orderId);
 * }
 * ```
 */
export class OrderNotFoundException extends AbstractHttpException {
  constructor(orderId: string) {
    super(
      "ORDER_NOT_FOUND", // errorCode
      "订单未找到", // title
      `ID 为 "${orderId}" 的订单不存在`, // detail
      404, // status
      { orderId }, // data
    );
  }
}
````

#### 步骤3：导出异常

```typescript
// libs/order/src/exceptions/index.ts
export { OrderNotFoundException } from "./order-not-found.exception.js";

// libs/order/src/index.ts
export * from "./exceptions/index.js";
```

#### 步骤4：使用异常

```typescript
// 在服务中使用
import { OrderNotFoundException } from "@hl8/order";

@Injectable()
export class OrderService {
  async findById(id: string) {
    const order = await this.orderRepo.findById(id);

    if (!order) {
      throw new OrderNotFoundException(id); // 直接使用
    }

    return order;
  }
}
```

---

### 3.3 定义复杂异常

#### 场景：带多个参数的异常

```typescript
/**
 * 库存不足异常
 *
 * @description 请求的商品数量超过可用库存时抛出
 */
export class ProductOutOfStockException extends AbstractHttpException {
  constructor(
    productId: string,
    requestedQuantity: number,
    availableStock: number,
  ) {
    super(
      "PRODUCT_OUT_OF_STOCK",
      "商品库存不足",
      `商品 ${productId} 库存不足。请求数量：${requestedQuantity}，可用库存：${availableStock}`,
      400,
      {
        productId,
        requestedQuantity,
        availableStock,
        shortfall: requestedQuantity - availableStock,
      },
    );
  }
}

// 使用
throw new ProductOutOfStockException("prod-123", 10, 5);

// 响应
// {
//   "errorCode": "PRODUCT_OUT_OF_STOCK",
//   "title": "商品库存不足",
//   "detail": "商品 prod-123 库存不足。请求数量：10，可用库存：5",
//   "status": 400,
//   "data": {
//     "productId": "prod-123",
//     "requestedQuantity": 10,
//     "availableStock": 5,
//     "shortfall": 5
//   }
// }
```

#### 场景：带根因的异常

```typescript
/**
 * 外部服务调用失败异常
 */
export class ExternalServiceException extends AbstractHttpException {
  constructor(serviceName: string, operation: string, rootCause: Error) {
    super(
      "EXTERNAL_SERVICE_ERROR",
      "外部服务调用失败",
      `调用 ${serviceName} 服务的 ${operation} 操作失败`,
      500,
      { serviceName, operation },
      rootCause, // ← 保留原始错误
    );
  }
}

// 使用
try {
  await this.paymentService.charge(amount);
} catch (error) {
  throw new ExternalServiceException("payment", "charge", error);
}

// 日志中会包含完整的错误链
// Error: External service error
//   Caused by: PaymentGatewayError: Connection timeout
```

---

### 3.4 异常定义的最佳实践

#### ✅ 推荐做法

````typescript
// 1. 语义化的类名
export class UserEmailAlreadyExistsException extends AbstractHttpException {}

// 2. 清晰的错误代码
errorCode: "USER_EMAIL_ALREADY_EXISTS"; // 大写，下划线分隔

// 3. 友好的错误消息
title: "邮箱已存在";
detail: `邮箱地址 "${email}" 已被其他用户使用`;

// 4. 有用的上下文数据
data: {
  (email, existingUserId);
}

// 5. 添加完整的文档注释
/**
 * 用户邮箱已存在异常
 *
 * @description 注册或更新邮箱时，该邮箱已被使用
 *
 * ## 业务规则
 * - 邮箱必须唯一
 * - 不区分大小写
 *
 * @example
 * ```typescript
 * throw new UserEmailAlreadyExistsException(email, existingUserId);
 * ```
 */
````

#### ❌ 避免的做法

```typescript
// ❌ 1. 不清晰的类名
export class Exception1 extends AbstractHttpException {}

// ❌ 2. 模糊的错误代码
errorCode: "ERROR"; // 太模糊

// ❌ 3. 无用的错误消息
detail: "Error occurred"; // 没说明什么错误

// ❌ 4. 缺少上下文数据
data: {
} // 空对象，没有有用信息

// ❌ 5. 暴露敏感信息
detail: `SQL Error: SELECT * FROM users WHERE password='${password}'`;
```

---

## 第四部分：根据环境输出异常信息

### 4.1 环境差异的必要性

#### 为什么需要区分环境？

**开发环境需求**：

- ✅ 详细的错误信息
- ✅ 完整的堆栈跟踪
- ✅ 所有上下文数据
- ✅ 便于调试

**生产环境需求**：

- ✅ 保护敏感信息
- ✅ 隐藏内部实现
- ✅ 友好的错误提示
- ✅ 避免被攻击利用

---

### 4.2 如何区分环境

#### 方式1：通过配置选项

```typescript
// app.module.ts
ExceptionModule.forRoot({
  isProduction: process.env.NODE_ENV === "production", // ← 环境标识
});
```

#### 方式2：从 AppConfig 获取

```typescript
// 推荐方式
ExceptionModule.forRootAsync({
  inject: [AppConfig],
  useFactory: (config: AppConfig) => ({
    isProduction: config.isProduction, // ← 从配置获取
  }),
});
```

---

### 4.3 环境差异的具体表现

#### 对比表格

| 特性           | 开发环境                 | 生产环境         |
| -------------- | ------------------------ | ---------------- |
| **错误详情**   | 完整的 detail            | 简化的 detail    |
| **堆栈跟踪**   | ✅ 包含 stack            | ❌ 不包含        |
| **上下文数据** | ✅ 完整的 data           | ⚠️ 过滤敏感字段  |
| **根因信息**   | ✅ 显示 rootCause        | ❌ 隐藏          |
| **日志级别**   | warn (4xx) + error (5xx) | error (5xx only) |
| **错误代码**   | ✅ 包含                  | ✅ 包含          |

#### 代码示例

```typescript
// 抛出异常
throw new GeneralInternalServerException(
  '数据库操作失败',
  '保存用户数据时连接超时',
  { operation: 'saveUser', userId: 'user-123' },
  new Error('Connection timeout')  // rootCause
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 开发环境响应 (isProduction: false)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
  "title": "数据库操作失败",
  "detail": "保存用户数据时连接超时",
  "status": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "instance": "req-abc-123",
  "data": {
    "operation": "saveUser",
    "userId": "user-123"
  },
  "stack": "Error: Connection timeout\n    at DatabaseService.save...",
  "rootCause": {
    "message": "Connection timeout",
    "stack": "..."
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生产环境响应 (isProduction: true)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
  "title": "数据库操作失败",
  "detail": "服务器内部错误，请稍后重试",  // ← 简化
  "status": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "instance": "req-abc-123"
  // ❌ 没有 data（可能包含敏感信息）
  // ❌ 没有 stack（暴露内部实现）
  // ❌ 没有 rootCause（暴露内部错误）
}
```

---

### 4.4 过滤器中的环境判断

#### HttpExceptionFilter 的实现

```typescript
@Catch(AbstractHttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: ILoggerService,
    private readonly messageProvider: ExceptionMessageProvider,
    private readonly isProduction: boolean, // ← 环境标识
  ) {}

  catch(exception: AbstractHttpException, host: ArgumentsHost) {
    const problemDetails = exception.toProblemDetails();

    // 环境相关的处理
    if (this.isProduction) {
      // 生产环境：移除敏感信息
      delete problemDetails.stack;
      delete problemDetails.rootCause;

      // 简化 detail（对于 5xx 错误）
      if (problemDetails.status >= 500) {
        problemDetails.detail = "服务器内部错误，请稍后重试";
      }

      // 过滤 data 中的敏感字段
      if (problemDetails.data) {
        problemDetails.data = this.filterSensitiveData(problemDetails.data);
      }
    }

    // 记录日志
    if (problemDetails.status >= 500) {
      this.logger.error(problemDetails.title, exception.stack);
    } else if (!this.isProduction) {
      this.logger.warn(problemDetails.title, problemDetails);
    }

    response.status(problemDetails.status).send(problemDetails);
  }
}
```

#### AnyExceptionFilter 的实现

```typescript
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: ILoggerService,
    private readonly isProduction: boolean, // ← 环境标识
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    // 生产环境：通用错误消息
    const detail = this.isProduction
      ? "服务器发生错误，请稍后重试"
      : `${exception.message}\n${exception.stack}`;

    const problemDetails = {
      type: "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
      title: "服务器内部错误",
      detail: detail,
      status: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      instance: this.getRequestId(host),
    };

    // 开发环境：添加堆栈
    if (!this.isProduction) {
      problemDetails.stack = exception.stack;
    }

    // 记录完整错误
    this.logger.error("Unhandled Exception", exception.stack, {
      type: exception.constructor.name,
    });

    response.status(500).send(problemDetails);
  }
}
```

---

### 4.5 在自定义异常中支持环境差异

#### 方式1：在异常类中判断（不推荐）

```typescript
// ❌ 不推荐：异常类不应该关心环境
export class MyException extends AbstractHttpException {
  constructor() {
    const detail =
      process.env.NODE_ENV === "production" ? "简化消息" : "详细消息";

    super("MY_ERROR", "title", detail, 400);
  }
}
```

#### 方式2：在过滤器中处理（推荐）

```typescript
// ✅ 推荐：让过滤器负责环境差异
export class MyException extends AbstractHttpException {
  constructor() {
    // 总是提供完整信息
    super(
      "MY_ERROR",
      "title",
      "完整的详细信息，包括技术细节", // ← 详细版本
      400,
      { technicalDetails: "..." },
    );
  }
}

// 过滤器会根据环境自动简化
// isProduction: true → 简化 detail，移除敏感 data
```

---

### 4.6 环境配置示例

#### 开发环境配置

```bash
# .env.local（开发环境）
NODE_ENV=development
LOG_LEVEL=debug
```

```typescript
// app.module.ts
ExceptionModule.forRoot({
  enableLogging: true,
  isProduction: false, // ← 开发环境
});

// 结果：
// - 详细的错误信息
// - 完整的堆栈跟踪
// - 所有上下文数据
// - warn 级别日志
```

#### 生产环境配置

```bash
# 生产环境（通过环境变量注入）
NODE_ENV=production
LOG_LEVEL=error
```

```typescript
// app.module.ts
ExceptionModule.forRoot({
  enableLogging: true,
  isProduction: true, // ← 生产环境
});

// 结果：
// - 简化的错误消息
// - 没有堆栈跟踪
// - 过滤敏感数据
// - error 级别日志（仅 5xx）
```

---

## 实践练习

### 练习1：定义业务异常

**需求**：定义一个"余额不足"异常

**要求**：

- 错误代码：`INSUFFICIENT_BALANCE`
- HTTP 状态码：400
- 包含：用户ID、当前余额、需要金额

**参考答案**：

```typescript
export class InsufficientBalanceException extends AbstractHttpException {
  constructor(userId: string, currentBalance: number, requiredAmount: number) {
    super(
      "INSUFFICIENT_BALANCE",
      "余额不足",
      `用户 ${userId} 余额不足。当前余额：${currentBalance}，需要金额：${requiredAmount}`,
      400,
      {
        userId,
        currentBalance,
        requiredAmount,
        shortfall: requiredAmount - currentBalance,
      },
    );
  }
}
```

---

### 练习2：在服务中使用异常

**需求**：在转账服务中检查余额并抛出异常

**参考答案**：

```typescript
@Injectable()
export class TransferService {
  async transfer(userId: string, amount: number) {
    // 1. 查询余额
    const balance = await this.getBalance(userId);

    // 2. 检查余额
    if (balance < amount) {
      throw new InsufficientBalanceException(userId, balance, amount);
    }

    // 3. 执行转账
    return this.executeTransfer(userId, amount);
  }
}
```

---

### 练习3：配置环境差异

**需求**：配置异常模块，开发环境显示详细信息，生产环境保护敏感信息

**参考答案**：

```typescript
// app.module.ts
import { TypedConfigModule, dotenvLoader } from "@hl8/config";
import { ExceptionModule } from "@hl8/exceptions";
import { AppConfig } from "./config/app.config.js";

@Module({
  imports: [
    // 1. 配置模块
    TypedConfigModule.forRoot({
      schema: AppConfig,
      isGlobal: true,
      load: [dotenvLoader()],
    }),

    // 2. 异常模块（从配置获取环境）
    ExceptionModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        enableLogging: true,
        isProduction: config.isProduction, // ← 从配置获取
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 总结和检查清单

### 异常处理的核心要点

#### 原则

- ✅ 统一的错误格式（RFC7807）
- ✅ 异常分层（基类 → 标准异常 → 业务异常）
- ✅ 异常即文档（清晰的消息和上下文）
- ✅ 早抛出，集中处理（服务层抛出，过滤器处理）

#### 机制

- ✅ 业务代码抛出异常
- ✅ 过滤器自动捕获和转换
- ✅ 记录日志
- ✅ 返回 RFC7807 响应

#### 过滤器

- ✅ HttpExceptionFilter - 处理 AbstractHttpException
- ✅ AnyExceptionFilter - 兜底处理所有异常
- ✅ 自动注册，无需手动配置

#### 定义异常

- ✅ 继承 AbstractHttpException
- ✅ 语义化的类名和错误代码
- ✅ 友好的错误消息
- ✅ 有用的上下文数据
- ✅ 完整的文档注释

#### 环境差异

- ✅ 通过 `isProduction` 控制
- ✅ 开发环境：详细信息
- ✅ 生产环境：保护敏感信息
- ✅ 过滤器自动处理差异

---

### 开发检查清单

#### 定义异常时

- [ ] 异常类名语义清晰
- [ ] 错误代码使用大写下划线
- [ ] 提供友好的错误消息
- [ ] 包含有用的上下文数据
- [ ] 添加完整的文档注释
- [ ] 不暴露敏感信息

#### 使用异常时

- [ ] 在服务层抛出异常
- [ ] 不在控制器中捕获异常
- [ ] 提供完整的上下文数据
- [ ] 使用合适的异常类型
- [ ] 保留根因（rootCause）

#### 配置模块时

- [ ] 正确设置 `isProduction`
- [ ] 启用日志记录
- [ ] 注册全局过滤器
- [ ] 从 AppConfig 获取配置（推荐）

---

### 快速参考

#### 常用异常类

```typescript
// 400 错误
throw new GeneralBadRequestException(title, detail, data);

// 404 错误
throw new GeneralNotFoundException(title, detail, data);

// 500 错误
throw new GeneralInternalServerException(title, detail, data, rootCause);

// 业务异常
throw new TenantNotFoundException(tenantId);
throw new InvalidIsolationContextException(message);
throw new UnauthorizedOrganizationException(orgId);
```

#### 异常结构

```typescript
new AbstractHttpException(
  "ERROR_CODE", // 错误代码（大写下划线）
  "简短标题", // title
  "详细说明", // detail
  404, // HTTP 状态码
  { key: "value" }, // 上下文数据（可选）
  rootCause, // 根因（可选）
);
```

#### 配置模块

```typescript
// 简单方式
ExceptionModule.forRoot({
  isProduction: process.env.NODE_ENV === "production",
});

// 推荐方式
ExceptionModule.forRootAsync({
  inject: [AppConfig],
  useFactory: (config: AppConfig) => ({
    isProduction: config.isProduction,
  }),
});
```

---

## 🎓 学习建议

### 理论学习

1. 阅读 [README.md](./README.md) - 完整文档
2. 理解 RFC7807 标准
3. 学习 NestJS 异常过滤器

### 实践练习

1. 定义 3 个业务异常
2. 在服务中使用异常
3. 测试开发和生产环境的响应差异

### 进阶学习

1. 自定义消息提供器（国际化）
2. 自定义日志服务
3. 异常监控和告警

---

## 📖 相关资源

### 文档

- [README.md](../README.md) - 模块完整文档
- [模块选项 vs 应用配置](../../../docs/guides/config/MODULE_OPTIONS_VS_APP_CONFIG.md)
- [配置使用指南](../../../docs/guides/config/CONFIGURATION_GUIDE.md)

### 代码

- `src/core/abstract-http.exception.ts` - 异常基类
- `src/filters/http-exception.filter.ts` - HTTP 异常过滤器
- `src/filters/any-exception.filter.ts` - 通用异常过滤器
- `src/config/exception.config.ts` - 模块选项定义

### 外部资源

- [RFC7807 Problem Details](https://tools.ietf.org/html/rfc7807)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

---

## ✅ 培训完成检查

### 自我测试

- [ ] 我能说出异常处理的4个核心原则
- [ ] 我能解释两个过滤器的分工
- [ ] 我能独立定义一个业务异常
- [ ] 我能配置环境差异
- [ ] 我知道何时使用标准异常，何时自定义
- [ ] 我理解模块选项vs应用配置的区别

### 全部勾选？

**恭喜！** 🎉 你已经掌握了 HL8 SAAS 平台的异常处理机制！

---

**有问题？** 查看 [README.md](./README.md) 的常见问题部分，或联系团队！
