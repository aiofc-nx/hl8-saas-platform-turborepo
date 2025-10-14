# Hybrid-Archi v1.1 快速参考

**版本**: 1.1.0  
**更新日期**: 2025-10-10

---

## 🚀 快速开始

### 安装

```bash
pnpm add @hl8/hybrid-archi
```

### 基本导入

```typescript
import {
  // 领域层
  BaseEntity,
  BaseAggregateRoot,
  BaseValueObject,
  BaseDomainEvent,
  EntityId,
  
  // CQRS
  BaseCommand,
  BaseQuery,
  CommandBus,
  QueryBus,
  EventBus,
  
  // 通用值对象库 (NEW v1.1)
  Code,
  Domain,
  Level,
  Name,
  Description,
  
  // 身份值对象
  Email,
  Username,
  PhoneNumber,
  Password,
  
  // 接口层
  BaseController,
  CliBaseCommand,
  
  // 守卫和装饰器
  JwtAuthGuard,
  RequirePermissions,
  TenantContext,
} from '@hl8/hybrid-archi';
```

---

## 📦 值对象速查

### BaseValueObject (泛型 API)

```typescript
// 基础用法
export class ProductCode extends BaseValueObject<string> {
  protected override validate(value: string): void {
    this.validateNotEmpty(value, '产品代码');
    this.validateLength(value, 5, 20, '产品代码');
  }
}

// 复杂对象
export class Address extends BaseValueObject<AddressProps> {
  protected override validate(props: AddressProps): void {
    this.validateNotEmpty(props.city, '城市');
  }
}

// 使用
const code = ProductCode.create('PROD-123');
console.log(code.value); // 'PROD-123'
```

### 通用值对象基类 (NEW v1.1)

```typescript
// Code - 代码类
export class TenantCode extends Code {
  // 自动验证: /^[a-z0-9-]+$/
  // 自动转换: toLowerCase()
}

// Domain - 域名类
export class ApiDomain extends Domain {
  // 自动验证: 标准域名格式
  // 自动转换: toLowerCase()
}

// Level - 级别类
export class VipLevel extends Level {
  constructor(value: number) {
    super(value, 1, 5);  // VIP1-VIP5
  }
}

// Name - 名称类
export class CategoryName extends Name {
  // 自动验证: 长度 2-100, 非空
  // 自动转换: trim()
}

// Description - 描述类
export class RoleDescription extends Description {
  // 允许为空, 最大 500 字符
}
```

### 验证辅助方法

```typescript
protected override validate(value: any): void {
  // 字符串
  this.validateNotEmpty(value, '字段');
  this.validateLength(value, min, max, '字段');
  this.validatePattern(value, /regex/, '消息');
  
  // 数值
  this.validateRange(value, min, max, '字段');
  this.validateInteger(value, '字段');
  this.validatePositive(value, '字段');
  
  // 枚举
  this.validateEnum(value, ['A', 'B'], '字段');
}
```

---

## 🎯 CQRS 速查

### Command (命令)

```typescript
import { BaseCommand } from '@hl8/hybrid-archi';

export class CreateUserCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    public readonly username: string,
    public readonly email: string,
  ) {
    super(tenantId, userId);
  }
}
```

### Query (查询)

```typescript
import { BaseQuery } from '@hl8/hybrid-archi';

export class GetUserQuery extends BaseQuery {
  constructor(
    tenantId: string,
    userId: string,
    public readonly targetUserId: string,
  ) {
    super(tenantId, userId);
  }
}
```

### Handler (处理器)

```typescript
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<void> {
    // 实现逻辑
  }
}
```

---

## 🖥️ CLI 速查

### CLI Command (NEW: CliBaseCommand)

```typescript
import { CliBaseCommand } from '@hl8/hybrid-archi';

export class MigrateCommand extends CliBaseCommand {
  async run(): Promise<void> {
    // 执行迁移
  }
}
```

**注意**: v1.0 的 `BaseCommand` 已重命名为 `CliBaseCommand`

---

## 🏗️ 实体速查

### Entity (实体)

```typescript
import { BaseEntity, EntityId } from '@hl8/hybrid-archi';

export class User extends BaseEntity {
  constructor(
    id: EntityId,
    private name: string,
    private email: string,
  ) {
    super(id);
  }
  
  getName(): string {
    return this.name;
  }
  
  updateName(newName: string): void {
    this.name = newName;
    this.updateTimestamp();
  }
}
```

### Aggregate Root (聚合根)

```typescript
import { BaseAggregateRoot, EntityId } from '@hl8/hybrid-archi';

export class Order extends BaseAggregateRoot {
  constructor(
    id: EntityId,
    private items: OrderItem[],
  ) {
    super(id);
  }
  
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.addDomainEvent(new ItemAddedEvent(this.id, item));
  }
}
```

---

## 🔐 守卫和装饰器速查

### JWT 认证

```typescript
import { JwtAuthGuard, CurrentUser } from '@hl8/hybrid-archi';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
```

### 权限控制

```typescript
import { RequirePermissions } from '@hl8/hybrid-archi';

@Controller('admin')
export class AdminController {
  @Post('users')
  @RequirePermissions('user:create')
  createUser() {
    // ...
  }
}
```

### 租户上下文

```typescript
import { TenantContext } from '@hl8/hybrid-archi';

@Controller('tenants')
export class TenantController {
  @Get('info')
  getTenantInfo(@TenantContext() tenantId: string) {
    return { tenantId };
  }
}
```

---

## 🎯 常用模式

### 创建值对象

```typescript
// 简单值对象
const email = Email.create('user@example.com');
const code = TenantCode.create('my-tenant');

// 复杂值对象
const address = Address.create({
  street: '123 Main St',
  city: 'Beijing',
  zipCode: '100000',
});
```

### 创建实体

```typescript
const userId = EntityId.generate();
const user = new User(userId, 'John Doe', 'john@example.com');
```

### 发送命令

```typescript
const command = new CreateUserCommand(
  tenantId,
  userId,
  'john-doe',
  'john@example.com',
);

await commandBus.execute(command);
```

### 发送查询

```typescript
const query = new GetUserQuery(tenantId, userId, targetUserId);
const user = await queryBus.execute(query);
```

---

## 🔄 v1.0 → v1.1 速查

| v1.0 | v1.1 | 说明 |
|------|------|------|
| `BaseValueObject` | `BaseValueObject<T>` | 需要泛型参数 |
| `BaseCommand` (CLI) | `CliBaseCommand` | 重命名 |
| `CqrsBaseCommand` | `BaseCommand` | 移除别名 |
| `CqrsBaseQuery` | `BaseQuery` | 移除别名 |
| `TenantStatus` | - | 移至 saas-core |
| `OrganizationStatus` | - | 移至 saas-core |
| - | `Code` | 新增 |
| - | `Domain` | 新增 |
| - | `Level` | 新增 |
| - | `Name` | 新增 |
| - | `Description` | 新增 |

---

## 📚 文档链接

### 核心文档

- [README](./README.md) - 完整介绍
- [CHANGELOG](./CHANGELOG.md) - 版本变更
- [MIGRATION GUIDE](./MIGRATION-GUIDE-v1.1.md) - 迁移指南

### 详细指南

- [值对象文档](./src/domain/value-objects/README.md)
- [领域层指南](../../docs/hybrid-archi/01-domain-layer.md)
- [应用层指南](../../docs/hybrid-archi/02-application-layer.md)
- [接口层指南](../../docs/hybrid-archi/04-interface-layer.md)

### 优化记录

- [优化规范](../../specs/002-hybrid-archi-optimization/spec.md)
- [优化进度](../../specs/002-hybrid-archi-optimization/optimization-progress.md)

---

## 💡 提示

### 代码片段

VS Code 用户可以添加以下代码片段：

```json
{
  "Value Object with Generic": {
    "prefix": "vo-generic",
    "body": [
      "export class ${1:ClassName} extends BaseValueObject<${2:string}> {",
      "  protected override validate(value: ${2:string}): void {",
      "    this.validateNotEmpty(value, '${3:字段名}');",
      "    $0",
      "  }",
      "}"
    ]
  },
  "Value Object from Code": {
    "prefix": "vo-code",
    "body": [
      "export class ${1:ClassName} extends Code {",
      "  protected override validate(value: string): void {",
      "    super.validate(value);",
      "    this.validateLength(value, ${2:3}, ${3:20}, '${4:字段名}');",
      "    $0",
      "  }",
      "}"
    ]
  }
}
```

### 常用命令

```bash
# 构建
pnpm nx build hybrid-archi

# 测试
pnpm nx test hybrid-archi

# Lint
pnpm nx lint hybrid-archi

# 查看导出
pnpm nx build hybrid-archi && ls dist/packages/hybrid-archi/src
```

---

**最后更新**: 2025-10-10  
**版本**: 1.1.0
