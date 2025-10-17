# HL8 SAAS平台异常处理机制和规范

## 📋 概述

本文档全面阐述HL8 SAAS平台的异常处理机制和规范，包括架构设计原则、异常分类体系、处理流程、最佳实践等。

## 🎯 设计原则

### 核心原则

1. **领域层纯净性**: 领域层异常不依赖任何外部框架
2. **分层处理**: 不同层有不同的异常处理职责
3. **自动转换**: 异常在层间自动转换，减少手动处理
4. **标准统一**: 遵循RFC7807标准和HTTP状态码规范
5. **类型安全**: 完整的TypeScript类型定义
6. **可追溯性**: 完整的异常上下文和堆栈信息

### 架构原则

- **依赖倒置**: 内层不依赖外层，保持领域层纯净
- **单一职责**: 每层只处理自己职责范围内的异常
- **开闭原则**: 易于扩展新的异常类型和处理逻辑
- **里氏替换**: 异常类可以互相替换而不影响功能

## 🏗️ 异常处理架构

### 整体架构层次

```
┌─────────────────────────────────────────────────────────────┐
│                    客户端层 (Client Layer)                    │
├─────────────────────────────────────────────────────────────┤
│                 基础设施层 (Infrastructure Layer)              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              HTTP异常转换 (HTTP Exception Conversion)    │ │
│  │  • 自动检测领域异常并转换                                │ │
│  │  • 转换为HTTP友好的异常                                  │ │
│  │  • 使用@hl8/exceptions过滤器                           │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   应用层 (Application Layer)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              异常转换层 (Exception Conversion)           │ │
│  │  • DomainExceptionConverter                             │ │
│  │  • 将领域异常转换为应用异常                              │ │
│  │  • 处理用例特定的异常                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    领域层 (Domain Layer)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              纯净领域异常 (Pure Domain Exceptions)       │ │
│  │  • BaseDomainException                                  │ │
│  │  • BusinessRuleViolationException                       │ │
│  │  • DomainValidationException                            │ │
│  │  • DomainStateException                                 │ │
│  │  • DomainPermissionException                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 异常流转过程

```
领域异常 → 应用层转换 → 基础设施层HTTP转换 → 客户端响应
    ↓           ↓              ↓
 业务规则    用例处理      控制器转换
    ↓           ↓              ↓
 纯净异常    HTTP异常      RFC7807格式
```

## 📚 异常分类体系

### 1. 领域层异常 (Domain Layer Exceptions)

领域层异常是纯净的业务异常，不依赖任何外部框架。

#### 基础异常类

```typescript
/**
 * 基础领域异常类
 */
export abstract class BaseDomainException extends Error {
  public readonly errorCode: string;
  public readonly errorType: DomainExceptionType;
  public readonly severity: DomainExceptionSeverity;
  public readonly context: Record<string, unknown>;
  public readonly occurredAt: Date;
  public readonly exceptionId: string;
}
```

#### 异常类型枚举

```typescript
export enum DomainExceptionType {
  BUSINESS_RULE = "business_rule", // 业务规则违反
  VALIDATION = "validation", // 数据验证失败
  STATE = "state", // 状态转换错误
  PERMISSION = "permission", // 权限不足
  CONCURRENCY = "concurrency", // 并发冲突
  NOT_FOUND = "not_found", // 资源未找到
}
```

#### 异常严重级别

```typescript
export enum DomainExceptionSeverity {
  LOW = "low", // 低级别：信息性异常
  MEDIUM = "medium", // 中级别：警告性异常
  HIGH = "high", // 高级别：错误性异常
  CRITICAL = "critical", // 关键级别：系统级异常
}
```

#### 具体异常类

##### 业务规则违反异常

```typescript
export class BusinessRuleViolationException extends BaseDomainException {
  constructor(
    message: string,
    ruleName: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `BUSINESS_RULE_VIOLATION_${ruleName.toUpperCase()}`,
      DomainExceptionType.BUSINESS_RULE,
      { ruleName, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }
}
```

##### 领域验证异常

```typescript
export class DomainValidationException extends BaseDomainException {
  constructor(
    message: string,
    fieldName: string,
    fieldValue: unknown,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `DOMAIN_VALIDATION_${fieldName.toUpperCase()}`,
      DomainExceptionType.VALIDATION,
      { fieldName, fieldValue, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }
}
```

##### 领域状态异常

```typescript
export class DomainStateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `DOMAIN_STATE_${requestedOperation.toUpperCase()}`,
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }
}
```

##### 领域权限异常

```typescript
export class DomainPermissionException extends BaseDomainException {
  constructor(
    message: string,
    requiredPermission: string,
    resource: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      `DOMAIN_PERMISSION_${requiredPermission.toUpperCase()}`,
      DomainExceptionType.PERMISSION,
      { requiredPermission, resource, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }
}
```

### 2. 应用层异常 (Application Layer Exceptions)

应用层异常继承自`@hl8/exceptions`的`AbstractHttpException`，遵循RFC7807标准。

#### 异常转换器

```typescript
import { DomainExceptionType } from "../../domain/exceptions/base/base-domain-exception.js";

export class DomainExceptionConverter {
  static toApplicationException(
    domainException: BaseDomainException,
  ): ApplicationException {
    const message = domainException.getUserFriendlyMessage();
    const context = domainException.context;

    switch (domainException.errorType) {
      case DomainExceptionType.BUSINESS_RULE:
        return new BusinessRuleViolationException(message, context);
      case DomainExceptionType.VALIDATION:
        return new ValidationException(
          domainException.errorCode,
          "数据验证失败",
          message,
          400,
          context,
        );
      case DomainExceptionType.PERMISSION:
        return new UnauthorizedOperationException(
          (context.requiredPermission as string) || "未知操作",
          context.userId as string,
        );
      case DomainExceptionType.NOT_FOUND:
        return new ResourceNotFoundException(
          (context.resourceType as string) || "资源",
          (context.resourceId as string) || "未知",
        );
      case DomainExceptionType.STATE:
      case DomainExceptionType.CONCURRENCY:
        return new BusinessRuleViolationException(message, context);
      default:
        return new BusinessRuleViolationException(message, context);
    }
  }
}
```

#### 具体应用异常类

##### 业务规则违反异常

```typescript
export class BusinessRuleViolationException extends ApplicationException {
  constructor(rule: string, context?: any) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违反",
      `业务规则违反: ${rule}`,
      400,
      { rule, context },
    );
  }
}
```

##### 验证异常

```typescript
export class ValidationException extends ApplicationException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: any,
  ) {
    super(errorCode, title, detail, status, data);
  }
}
```

##### 资源未找到异常

```typescript
export class ResourceNotFoundException extends ApplicationException {
  constructor(resourceType: string, resourceId: string) {
    super(
      "RESOURCE_NOT_FOUND",
      "资源未找到",
      `资源未找到: ${resourceType} (${resourceId})`,
      404,
      { resourceType, resourceId },
    );
  }
}
```

##### 未授权操作异常

```typescript
export class UnauthorizedOperationException extends ApplicationException {
  constructor(operation: string, userId?: string) {
    super(
      "UNAUTHORIZED_OPERATION",
      "未授权操作",
      `用户无权限执行操作: ${operation}`,
      403,
      { operation, userId },
    );
  }
}
```

### 3. 基础设施层异常处理

基础设施层负责将应用异常转换为HTTP友好的异常响应。

#### 控制器异常处理

```typescript
private handleException(error: any, operation: string): never {
  this.logger.error(`${operation}失败`, error.message);

  // 如果是领域异常，先转换为应用异常
  if (error instanceof BaseDomainException) {
    const appException =
      DomainExceptionConverter.toApplicationException(error);
    error = appException;
  }

  if (error instanceof BusinessRuleViolationException) {
    throw new BadRequestException(error.message);
  }

  if (error instanceof ResourceNotFoundException) {
    throw new NotFoundException(error.message);
  }

  // 其他未预期的异常
  throw new InternalServerErrorException(
    `${operation}失败: ${error.message}`,
  );
}
```

## 🔄 异常处理流程

### 1. 领域层异常抛出

```typescript
// 在领域层抛出纯净的领域异常
throw new BusinessRuleViolationException(
  "租户名称不能为空",
  "TENANT_NAME_REQUIRED",
  { tenantName: "" },
);
```

### 2. 应用层异常转换

```typescript
// 应用层自动检测领域异常并转换
try {
  // 领域操作
} catch (error) {
  if (error instanceof BaseDomainException) {
    const appException = DomainExceptionConverter.toApplicationException(error);
    throw appException;
  }
  throw error;
}
```

### 3. 基础设施层HTTP转换

```typescript
// 控制器自动处理异常转换
@Post()
async createTenant(@Body() request: CreateTenantDto) {
  try {
    return await this.createTenantUseCase.execute(request);
  } catch (error) {
    this.handleException(error, "租户创建");
  }
}
```

### 4. 最终HTTP响应

```json
{
  "type": "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
  "title": "业务规则违反",
  "detail": "业务规则违反: 租户名称不能为空",
  "status": 400,
  "errorCode": "BUSINESS_RULE_VIOLATION",
  "instance": "req-abc-123",
  "data": {
    "rule": "租户名称不能为空",
    "context": { "tenantName": "" }
  }
}
```

## 📊 异常映射关系

### 领域异常类型到应用异常的映射

| 领域异常类型                        | 应用异常类                       | HTTP状态码 | 说明         |
| ----------------------------------- | -------------------------------- | ---------- | ------------ |
| `DomainExceptionType.BUSINESS_RULE` | `BusinessRuleViolationException` | 400        | 业务规则违反 |
| `DomainExceptionType.VALIDATION`    | `ValidationException`            | 400        | 数据验证失败 |
| `DomainExceptionType.PERMISSION`    | `UnauthorizedOperationException` | 403        | 权限不足     |
| `DomainExceptionType.NOT_FOUND`     | `ResourceNotFoundException`      | 404        | 资源未找到   |
| `DomainExceptionType.STATE`         | `BusinessRuleViolationException` | 409        | 状态转换错误 |
| `DomainExceptionType.CONCURRENCY`   | `BusinessRuleViolationException` | 409        | 并发冲突     |

### HTTP状态码规范

| 状态码 | 异常类型            | 使用场景                   |
| ------ | ------------------- | -------------------------- |
| 400    | BadRequest          | 业务规则违反、数据验证失败 |
| 401    | Unauthorized        | 身份认证失败               |
| 403    | Forbidden           | 权限不足                   |
| 404    | NotFound            | 资源未找到                 |
| 409    | Conflict            | 资源冲突、状态错误         |
| 500    | InternalServerError | 系统内部错误               |

## 🎨 最佳实践

### 1. 异常命名规范

#### 领域异常命名

```typescript
// ✅ 正确：明确的业务含义
throw new BusinessRuleViolationException(
  "用户邮箱已存在",
  "USER_EMAIL_EXISTS",
  { email: "user@example.com" },
);

// ❌ 错误：模糊的异常名称
throw new Error("Something went wrong");
```

#### 异常代码规范

```typescript
// ✅ 正确：大写蛇形命名法
"TENANT_NAME_REQUIRED";
"USER_EMAIL_ALREADY_EXISTS";
"PERMISSION_DENIED";

// ❌ 错误：不一致的命名
"tenantNameRequired";
"user_email_already_exists";
"PermissionDenied";
```

### 2. 异常上下文信息

```typescript
// ✅ 正确：提供丰富的上下文信息
throw new BusinessRuleViolationException(
  "租户配额已满",
  "TENANT_QUOTA_EXCEEDED",
  {
    tenantId: tenantId.toString(),
    currentUsers: 100,
    maxUsers: 100,
    planType: "BASIC",
  },
);

// ❌ 错误：缺少上下文信息
throw new BusinessRuleViolationException("配额已满");
```

### 3. 异常链式追踪

```typescript
// ✅ 正确：保留原始异常信息
try {
  await this.externalService.call();
} catch (error) {
  throw new BusinessRuleViolationException(
    "外部服务调用失败",
    "EXTERNAL_SERVICE_ERROR",
    { service: "payment" },
    error, // 保留原始异常作为rootCause
  );
}
```

### 4. 异常日志记录

```typescript
// ✅ 正确：记录完整的异常信息
catch (error) {
  this.logger.error("租户创建失败", {
    error: error.message,
    stack: error.stack,
    context: error.context,
    operation: "createTenant",
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

### 5. 异常处理边界

```typescript
// ✅ 正确：在合适的边界处理异常
class TenantService {
  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    try {
      // 领域操作
      return await this.tenantAggregate.create(request);
    } catch (error) {
      // 在应用层边界转换异常
      if (error instanceof BaseDomainException) {
        throw DomainExceptionConverter.toApplicationException(error);
      }
      throw error;
    }
  }
}
```

## 🔧 配置和集成

### 1. 异常模块配置

```typescript
// 在应用模块中配置异常处理
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
      registerGlobalFilters: true,
    }),
  ],
})
export class AppModule {}
```

### 2. 全局异常过滤器

```typescript
// 自动注册的全局异常过滤器
// - HttpExceptionFilter: 处理AbstractHttpException
// - AnyExceptionFilter: 处理所有其他异常
```

### 3. 日志集成

```typescript
// 与日志系统集成
ExceptionModule.forRootAsync({
  inject: [FastifyLoggerService],
  useFactory: (logger: FastifyLoggerService) => ({
    enableLogging: true,
    logger: logger,
  }),
}),
```

## 📈 性能考虑

### 1. 异常创建开销

- ✅ 异常对象创建很轻量
- ✅ 堆栈跟踪仅在必要时生成
- ✅ 上下文信息支持懒加载

### 2. 生产环境优化

```typescript
ExceptionModule.forRoot({
  isProduction: true,
  enableLogging: true, // 保留日志，但减少详情
});
```

在生产环境：

- 自动隐藏敏感堆栈信息
- 简化错误响应
- 优化日志输出

## 🔐 安全考虑

### 1. 敏感信息保护

```typescript
// ✅ 好的做法：不暴露敏感信息
throw new BusinessRuleViolationException("数据库操作失败", "DATABASE_ERROR", {
  operation: "save",
});

// ❌ 避免暴露：敏感信息
throw new BusinessRuleViolationException("数据库错误", "DATABASE_ERROR", {
  connectionString: "postgres://user:pass@host:5432/db",
});
```

### 2. 生产环境自动脱敏

```typescript
// isProduction: true 时
// 自动隐藏堆栈跟踪
// 自动简化错误详情
```

### 3. 日志安全

```typescript
// 实现自定义logger，过滤敏感字段
export class SafeLogger implements ILoggerService {
  error(message: string, trace?: string, context?: any) {
    // 过滤context中的敏感字段
    const safeContext = this.removeSensitiveData(context);
    this.logger.error(message, safeContext);
  }
}
```

## 🧪 测试策略

### 1. 单元测试

```typescript
describe("BusinessRuleViolationException", () => {
  it("should create exception with correct properties", () => {
    const exception = new BusinessRuleViolationException(
      "测试规则",
      "TEST_RULE",
    );

    expect(exception.errorType).toBe(DomainExceptionType.BUSINESS_RULE);
    expect(exception.severity).toBe(DomainExceptionSeverity.HIGH);
    expect(exception.errorCode).toBe("BUSINESS_RULE_VIOLATION_TEST_RULE");
  });
});
```

### 2. 集成测试

```typescript
describe("DomainExceptionConverter", () => {
  it("should convert domain exception to application exception", () => {
    const domainException = new BusinessRuleViolationException(
      "测试规则",
      "TEST_RULE",
    );

    const appException =
      DomainExceptionConverter.toApplicationException(domainException);

    expect(appException).toBeInstanceOf(BusinessRuleViolationException);
    expect(appException.message).toContain("业务规则违反");
  });
});
```

### 3. 端到端测试

```typescript
describe("Tenant API", () => {
  it("should return proper error response for business rule violation", async () => {
    const response = await request(app)
      .post("/tenants")
      .send({ name: "", type: "ENTERPRISE" })
      .expect(400);

    expect(response.body).toMatchObject({
      type: expect.stringContaining("BUSINESS_RULE_VIOLATION"),
      title: "业务规则违反",
      status: 400,
      errorCode: "BUSINESS_RULE_VIOLATION",
    });
  });
});
```

## 📚 相关文档

### 核心文档

- [代码注释规范](../constitutions/code-comment-standards.md)
- [混合架构指南](./hybrid-architecture-guide.md)
- [领域驱动设计指南](./domain-driven-design-guide.md)

### 标准规范

- [RFC7807 Problem Details](https://tools.ietf.org/html/rfc7807)
- [HTTP状态码规范](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [NestJS异常过滤器](https://docs.nestjs.com/exception-filters)

### 项目文档

- [@hl8/exceptions模块文档](../../libs/exceptions/README.md)
- [@hl8/business-core模块文档](../../libs/business-core/README.md)

## 🤝 贡献指南

### 添加新的异常类型

1. **领域层异常**：在`libs/business-core/src/domain/exceptions/`中添加
2. **应用层异常**：在`libs/business-core/src/common/exceptions/`中添加
3. **转换逻辑**：在`DomainExceptionConverter`中添加转换规则
4. **测试用例**：添加相应的单元测试和集成测试
5. **文档更新**：更新本文档的相关部分

### 异常处理改进

1. **性能优化**：优化异常创建和处理性能
2. **安全增强**：改进敏感信息保护机制
3. **监控集成**：添加异常监控和告警
4. **国际化支持**：支持多语言错误消息

## 📋 领域层异常使用规范

### 重要原则

**领域层必须保持纯净性**：

- 不能导入任何NestJS或外部框架的异常类
- 所有异常必须继承自`BaseDomainException`或其子类
- 使用枚举类型`DomainExceptionType`和`DomainExceptionSeverity`进行分类

### 正确使用示例

```typescript
// ✅ 正确的领域异常使用
import { BusinessRuleViolationException } from "../exceptions/base/base-domain-exception.js";

throw new BusinessRuleViolationException(
  "租户名称不能为空",
  "EMPTY_TENANT_NAME",
);

// ✅ 正确的状态异常使用
import { DomainStateException } from "../exceptions/base/base-domain-exception.js";

throw new DomainStateException(
  "Cannot delete an entity that is already deleted",
  "DELETED",
  "DELETE",
  { entityId: this.id.toString() },
);
```

### 错误使用示例

```typescript
// ❌ 错误的领域异常使用 - 禁止使用NestJS异常
import { BadRequestException } from "@nestjs/common";
throw new BadRequestException("租户名称不能为空");

// ❌ 错误的领域异常使用 - 禁止使用其他框架异常
import { ValidationError } from "some-external-library";
throw new ValidationError("数据验证失败");
```

### 领域异常使用场景

| 组件类型                   | 推荐异常类型                     | 使用场景         |
| -------------------------- | -------------------------------- | ---------------- |
| 实体（Entity）             | `BusinessRuleViolationException` | 业务规则验证失败 |
| 实体（Entity）             | `DomainStateException`           | 状态转换错误     |
| 聚合根（Aggregate Root）   | `BusinessRuleViolationException` | 业务规则验证失败 |
| 聚合根（Aggregate Root）   | `DomainPermissionException`      | 跨租户操作禁止   |
| 值对象（Value Object）     | `DomainValidationException`      | 数据格式验证失败 |
| 领域服务（Domain Service） | `BusinessRuleViolationException` | 业务逻辑错误     |

## 📄 更新日志

### v1.1.0 (2024-01-15)

- 修复领域层异常污染问题
- 标准化领域层异常使用规范
- 完善异常处理文档
- 强化领域层纯净性原则

### v1.0.0 (2024-01-01)

- 初始版本发布
- 实现基础异常处理架构
- 支持领域层、应用层、基础设施层异常处理
- 集成RFC7807标准
- 支持自动异常转换

---

**注意**: 本文档会随着项目发展持续更新，请定期查看最新版本。
