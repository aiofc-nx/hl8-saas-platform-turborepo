# @hl8/exceptions

统一的异常处理模块，遵循 RFC7807 标准

## 📋 概述

`@hl8/exceptions` 是一个企业级的 NestJS 异常处理库，提供：

- ✅ **RFC7807 标准**: 符合 [RFC7807 Problem Details](https://tools.ietf.org/html/rfc7807) 标准的错误响应
- ✅ **丰富的异常类**: 预定义的标准异常类和业务异常类
- ✅ **全局过滤器**: 自动捕获和转换所有异常
- ✅ **消息定制**: 支持自定义错误消息提供器
- ✅ **完整日志**: 集成日志服务，记录异常详情
- ✅ **类型安全**: 完整的 TypeScript 类型定义

## 📦 安装

```bash
pnpm add @hl8/exceptions
```

## 🚀 快速开始

### 1. 导入模块

```typescript
import { Module } from '@nestjs/common';
import { ExceptionModule } from '@hl8/exceptions';

@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === 'production',
    }),
  ],
})
export class AppModule {}
```

### 2. 使用异常类

```typescript
import { 
  GeneralNotFoundException,
  GeneralBadRequestException,
} from '@hl8/exceptions';

@Injectable()
export class UserService {
  async findById(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new GeneralNotFoundException(
        '用户未找到',
        `ID 为 "${userId}" 的用户不存在`,
        { userId }
      );
    }
    
    return user;
  }
}
```

## 📚 核心概念

### 异常基类

所有自定义异常都继承自 `AbstractHttpException`：

```typescript
import { AbstractHttpException } from '@hl8/exceptions';

export class CustomException extends AbstractHttpException {
  constructor(message: string) {
    super(
      'CUSTOM_ERROR',      // 错误代码
      '自定义错误',         // 简短标题
      message,             // 详细说明
      400,                 // HTTP 状态码
      { timestamp: Date.now() }  // 附加数据（可选）
    );
  }
}
```

### RFC7807 响应格式

所有异常自动转换为 RFC7807 格式：

```json
{
  "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
  "title": "用户未找到",
  "detail": "ID 为 \"user-123\" 的用户不存在",
  "status": 404,
  "errorCode": "USER_NOT_FOUND",
  "instance": "req-abc-123",
  "data": {
    "userId": "user-123"
  }
}
```

## 🎯 预定义异常类

### 标准 HTTP 异常

#### GeneralBadRequestException (400)

```typescript
throw new GeneralBadRequestException(
  '邮箱格式错误',
  `邮箱地址 "${email}" 格式不正确`,
  { email, expectedFormat: 'user@example.com' }
);
```

#### GeneralNotFoundException (404)

```typescript
throw new GeneralNotFoundException(
  '用户未找到',
  `ID 为 "${userId}" 的用户不存在`,
  { userId }
);
```

#### GeneralInternalServerException (500)

```typescript
try {
  await this.externalService.call();
} catch (error) {
  throw new GeneralInternalServerException(
    '外部服务调用失败',
    '调用支付服务时发生错误',
    { service: 'payment' },
    error  // rootCause
  );
}
```

### 业务异常

#### InvalidIsolationContextException

```typescript
throw new InvalidIsolationContextException('隔离上下文无效');
```

#### TenantNotFoundException

```typescript
throw new TenantNotFoundException(tenantId);
```

#### UnauthorizedOrganizationException

```typescript
throw new UnauthorizedOrganizationException(orgId);
```

## ⚙️ 配置选项

### 同步配置

```typescript
ExceptionModule.forRoot({
  // 是否启用日志记录
  enableLogging: true,
  
  // 自定义日志服务
  logger: customLoggerService,
  
  // 自定义消息提供器
  messageProvider: customMessageProvider,
  
  // 是否为生产环境
  isProduction: process.env.NODE_ENV === 'production',
  
  // 是否注册全局过滤器
  registerGlobalFilters: true,
})
```

### 异步配置

```typescript
ExceptionModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    enableLogging: config.get('LOGGING_ENABLED'),
    isProduction: config.get('NODE_ENV') === 'production',
  }),
  inject: [ConfigService],
})
```

## 🔧 高级功能

### 自定义消息提供器

实现 `ExceptionMessageProvider` 接口：

```typescript
import { ExceptionMessageProvider } from '@hl8/exceptions';

@Injectable()
export class I18nMessageProvider implements ExceptionMessageProvider {
  constructor(private i18n: I18nService) {}
  
  getMessage(
    errorCode: string, 
    field: 'title' | 'detail', 
    data?: any
  ): string | undefined {
    return this.i18n.t(`errors.${errorCode}.${field}`, data);
  }
  
  hasMessage(errorCode: string): boolean {
    return this.i18n.exists(`errors.${errorCode}`);
  }
}
```

### 自定义日志服务

实现 `ILoggerService` 接口：

```typescript
export interface ILoggerService {
  log(message: string, context?: any): void;
  error(message: string, trace?: string, context?: any): void;
  warn(message: string, context?: any): void;
}
```

## 📊 异常过滤器

### HttpExceptionFilter

自动捕获所有 `AbstractHttpException` 的异常：

- ✅ 转换为 RFC7807 格式
- ✅ 填充 `instance` 字段（请求 ID）
- ✅ 记录日志（4xx 为 warn，5xx 为 error）
- ✅ 支持自定义消息

### AnyExceptionFilter

捕获所有未处理的异常：

- ✅ 将任何异常转换为 500 错误
- ✅ 生产环境自动脱敏
- ✅ 开发环境包含详细堆栈
- ✅ 记录完整错误信息

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成覆盖率报告
pnpm test:cov
```

## 📖 API 文档

### 核心类

- **AbstractHttpException**: 抽象基类
- **ProblemDetails**: RFC7807 响应接口

### 标准异常类

- **GeneralBadRequestException**: 400 错误
- **GeneralNotFoundException**: 404 错误
- **GeneralInternalServerException**: 500 错误

### 业务异常类

- **InvalidIsolationContextException**: 无效隔离上下文
- **TenantNotFoundException**: 租户未找到
- **UnauthorizedOrganizationException**: 未授权的组织

### 过滤器

- **HttpExceptionFilter**: HTTP 异常过滤器
- **AnyExceptionFilter**: 通用异常过滤器

### 消息提供器

- **ExceptionMessageProvider**: 消息提供器接口
- **DefaultMessageProvider**: 默认消息提供器

### 配置

- **ExceptionModuleOptions**: 模块配置选项
- **ExceptionModuleAsyncOptions**: 异步配置选项

## 🎨 最佳实践

### 1. 使用明确的错误代码

```typescript
// 好
export class OrderNotFoundException extends AbstractHttpException {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', '订单未找到', `订单 ${orderId} 不存在`, 404, { orderId });
  }
}

// 不好
throw new Error('Not found');
```

### 2. 提供有用的上下文数据

```typescript
// 好
throw new GeneralBadRequestException(
  '库存不足',
  `请求数量 ${quantity} 超过可用库存 ${stock}`,
  { requestedQuantity: quantity, availableStock: stock }
);

// 不好
throw new GeneralBadRequestException('库存不足', '库存不足');
```

### 3. 链式追踪错误

```typescript
try {
  await this.externalService.call();
} catch (error) {
  throw new GeneralInternalServerException(
    '服务调用失败',
    '调用外部服务时发生错误',
    { service: 'external' },
    error  // 保留原始错误作为 rootCause
  );
}
```

### 4. 避免在响应中暴露敏感信息

```typescript
// 好
throw new GeneralInternalServerException(
  '数据库操作失败',
  '保存用户数据时发生错误',
  { operation: 'saveUser' }
);

// 不好（暴露了数据库信息）
throw new GeneralInternalServerException(
  '数据库错误',
  `Connection to postgres://admin:password@localhost:5432/db failed`
);
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [RFC7807 标准](https://tools.ietf.org/html/rfc7807)
- [NestJS 文档](https://docs.nestjs.com/)
- [项目主页](https://github.com/aiofc-nx/hl8-saas-platform-turborepo)
