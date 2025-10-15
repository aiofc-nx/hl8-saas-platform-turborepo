# @hl8/nestjs-isolation

NestJS 数据隔离实现库 - 基于 `@hl8/isolation-model` 领域模型

---

## ⚠️ 重要说明

### 模块配置方式

本模块使用 **forRoot()** 进行配置，**无需配置选项**。

**关键点**：

- ✅ 直接调用 `IsolationModule.forRoot()` 即可
- ✅ 自动集成 nestjs-cls 进行上下文管理
- ✅ 自动从请求头提取隔离上下文
- ✅ **不需要**额外的配置类或选项
- ✅ 全局模块，注册一次全局可用

**简单使用**：

```typescript
@Module({
  imports: [
    IsolationModule.forRoot(), // ← 无需配置选项
  ],
})
export class AppModule {}
```

---

## 📚 目录

- [重要说明](#-重要说明)
- [概述](#-概述)
- [特性](#-特性)
- [安装](#-安装)
- [快速开始](#-快速开始)
- [核心概念](#-核心概念)
- [API 文档](#-api-文档)
- [请求头规范](#-请求头规范)
- [使用场景](#-使用场景)
- [与其他模块集成](#-与其他模块集成)
- [常见问题](#-常见问题)
- [最佳实践](#-最佳实践)
- [架构设计](#️-架构设计)
- [性能考虑](#-性能考虑)
- [相关链接](#-相关链接)

---

## 📋 概述

`@hl8/nestjs-isolation` 是一个企业级的 NestJS 数据隔离库，提供：

- ✅ **多租户隔离**：支持租户、组织、部门、用户多级隔离
- ✅ **自动上下文提取**：从请求头自动提取隔离上下文
- ✅ **类型安全**：基于 `@hl8/isolation-model` 领域模型
- ✅ **装饰器支持**：提供 `@RequireTenant()`、`@CurrentContext()` 等装饰器
- ✅ **守卫保护**：自动验证隔离级别要求
- ✅ **框架无关**：支持 Fastify 和 Express

## ✨ 特性

### 核心功能

- ✅ **5 个隔离层级**：Platform → Tenant → Organization → Department → User
- ✅ **自动上下文提取**：从请求头自动提取隔离上下文
- ✅ **请求级上下文**：基于 nestjs-cls 实现，线程安全
- ✅ **装饰器系统**：`@RequireTenant()`、`@RequireOrganization()`、`@RequireDepartment()`
- ✅ **上下文注入**：`@CurrentContext()` 直接注入当前上下文
- ✅ **守卫保护**：自动验证隔离级别
- ✅ **服务支持**：提供 `IsolationContextService` 和 `MultiLevelIsolationService`

### 技术特性

- ✅ **框架支持**：Fastify 和 Express
- ✅ **全局模块**：注册一次，全局可用
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **零配置**：开箱即用，无需复杂配置
- ✅ **领域驱动**：基于纯领域模型 `@hl8/isolation-model`

## 📦 安装

```bash
pnpm add @hl8/nestjs-isolation
```

## 🚀 快速开始

### 步骤1：导入模块

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { IsolationModule } from "@hl8/nestjs-isolation";

@Module({
  imports: [
    IsolationModule.forRoot(), // ← 注册隔离模块
  ],
})
export class AppModule {}
```

### 步骤2：使用装饰器

```typescript
// user.controller.ts
import { Controller, Get } from "@nestjs/common";
import { RequireTenant, CurrentContext } from "@hl8/nestjs-isolation";
import { IsolationContext } from "@hl8/isolation-model/index.js";

@Controller("users")
export class UserController {
  @Get()
  @RequireTenant() // ← 要求租户级上下文
  async getUsers(@CurrentContext() context: IsolationContext) {
    // context.tenantId 自动从请求头提取
    console.log("Tenant ID:", context.tenantId?.value);
    console.log("Level:", context.level);

    return this.userService.findByTenant(context.tenantId);
  }
}
```

### 步骤3：发送请求

```bash
# 租户级请求
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:3000/api/users

# 组织级请求
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-Organization-Id: 6ba7b810-9dad-41d1-80b4-00c04fd430c8" \
     http://localhost:3000/api/users

# 部门级请求
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-Organization-Id: 6ba7b810-9dad-41d1-80b4-00c04fd430c8" \
     -H "X-Department-Id: 7c4a4e18-09cb-47a0-94e0-7f6eea3e1234" \
     http://localhost:3000/api/users
```

---

## 📚 核心概念

### 5 个隔离层级

本模块支持 5 个层级的数据隔离，层级越高，隔离范围越小：

```
1. Platform（平台级）   - 最低层级，无隔离
   ↓
2. Tenant（租户级）     - 按租户隔离
   ↓
3. Organization（组织级）- 按组织隔离（需要租户）
   ↓
4. Department（部门级）  - 按部门隔离（需要租户和组织）
   ↓
5. User（用户级）       - 按用户隔离（可选租户）
```

#### 层级详解

| 层级             | 说明           | 必需字段                                     | 使用场景             |
| ---------------- | -------------- | -------------------------------------------- | -------------------- |
| **Platform**     | 平台级，无隔离 | -                                            | 系统管理员、全局数据 |
| **Tenant**       | 租户级         | `tenantId`                                   | 多租户 SAAS 应用     |
| **Organization** | 组织级         | `tenantId`, `organizationId`                 | 大型企业，多组织管理 |
| **Department**   | 部门级         | `tenantId`, `organizationId`, `departmentId` | 部门独立管理         |
| **User**         | 用户级         | `userId`, `tenantId`(可选)                   | 个人数据隔离         |

### 隔离上下文（IsolationContext）

隔离上下文是一个值对象，包含当前请求的隔离信息：

```typescript
interface IsolationContext {
  // 当前隔离级别
  level: IsolationLevel;

  // ID 字段（根据层级不同而不同）
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  departmentId?: DepartmentId;
  userId?: UserId;

  // 工具方法
  isTenantLevel(): boolean;
  isOrganizationLevel(): boolean;
  isDepartmentLevel(): boolean;
  isUserLevel(): boolean;
}
```

### 自动上下文提取

模块自动从请求头提取隔离上下文，优先级规则：

```typescript
// 优先级：部门 > 组织 > 租户 > 用户 > 平台

if (有 deptId && orgId && tenantId) {
  → Department Level
} else if (有 orgId && tenantId) {
  → Organization Level
} else if (有 userId) {
  → User Level (可能有租户，也可能没有)
} else if (有 tenantId) {
  → Tenant Level
} else {
  → Platform Level (默认)
}
```

---

## 📖 API 文档

### 装饰器

#### @CurrentContext()

注入当前请求的隔离上下文：

```typescript
import { CurrentContext } from '@hl8/nestjs-isolation';
import { IsolationContext } from '@hl8/isolation-model';

@Get('profile')
async getProfile(@CurrentContext() context: IsolationContext) {
  console.log('Level:', context.level);
  console.log('Tenant ID:', context.tenantId?.value);
  return { level: context.level };
}
```

#### @RequireTenant()

要求租户级或更高层级：

```typescript
import { RequireTenant } from '@hl8/nestjs-isolation';

@Get('users')
@RequireTenant()  // 必须有 tenantId
async getUsers() {
  // 如果请求头没有 X-Tenant-Id，会返回 403
  return this.userService.findAll();
}
```

#### @RequireOrganization()

要求组织级或更高层级：

```typescript
import { RequireOrganization } from '@hl8/nestjs-isolation';

@Get('departments')
@RequireOrganization()  // 必须有 tenantId 和 organizationId
async getDepartments() {
  return this.deptService.findAll();
}
```

#### @RequireDepartment()

要求部门级：

```typescript
import { RequireDepartment } from '@hl8/nestjs-isolation';

@Get('tasks')
@RequireDepartment()  // 必须有 tenantId、organizationId 和 departmentId
async getTasks() {
  return this.taskService.findAll();
}
```

---

### 服务

#### IsolationContextService

获取当前请求的隔离上下文：

```typescript
import { IsolationContextService } from "@hl8/nestjs-isolation";

@Injectable()
export class UserService {
  constructor(private readonly isolationContext: IsolationContextService) {}

  async findUsers() {
    const context = this.isolationContext.getContext();
    console.log("Current level:", context.level);

    if (context.isTenantLevel()) {
      return this.findByTenant(context.tenantId);
    }
    // ...
  }
}
```

#### MultiLevelIsolationService

多级隔离服务，提供层级验证和数据访问控制：

```typescript
import { MultiLevelIsolationService } from "@hl8/nestjs-isolation";

@Injectable()
export class DataService {
  constructor(private readonly multiLevel: MultiLevelIsolationService) {}

  async getData() {
    const context = this.multiLevel.getCurrentContext();

    // 根据层级返回不同数据
    if (context.isDepartmentLevel()) {
      return this.getDepartmentData(context);
    }
    // ...
  }
}
```

---

## 📬 请求头规范

### 标准请求头

| 请求头              | 说明    | 格式   | 必需           |
| ------------------- | ------- | ------ | -------------- |
| `X-Tenant-Id`       | 租户 ID | UUID   | 租户级及以上   |
| `X-Organization-Id` | 组织 ID | UUID   | 组织级及以上   |
| `X-Department-Id`   | 部门 ID | UUID   | 部门级         |
| `X-User-Id`         | 用户 ID | UUID   | 用户级         |
| `X-Request-Id`      | 请求 ID | 字符串 | 否（自动生成） |

### 请求示例

#### 平台级请求（无隔离）

```bash
curl http://localhost:3000/api/stats
# 无需任何隔离相关的请求头
```

#### 租户级请求

```bash
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:3000/api/users
```

#### 组织级请求

```bash
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-Organization-Id: 6ba7b810-9dad-41d1-80b4-00c04fd430c8" \
     http://localhost:3000/api/departments
```

#### 部门级请求

```bash
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-Organization-Id: 6ba7b810-9dad-41d1-80b4-00c04fd430c8" \
     -H "X-Department-Id: 7c4a4e18-09cb-47a0-94e0-7f6eea3e1234" \
     http://localhost:3000/api/tasks
```

#### 用户级请求

```bash
# 带租户的用户
curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-User-Id: 9d4f6e8a-1234-5678-90ab-cdef12345678" \
     http://localhost:3000/api/profile

# 不带租户的用户（个人账户）
curl -H "X-User-Id: 9d4f6e8a-1234-5678-90ab-cdef12345678" \
     http://localhost:3000/api/profile
```

---

## 🎯 使用场景

### 场景1：多租户 SAAS 应用

```typescript
// 每个租户的数据完全隔离
@Controller("products")
export class ProductController {
  @Get()
  @RequireTenant() // 要求租户上下文
  async getProducts(@CurrentContext() context: IsolationContext) {
    // 只返回当前租户的产品
    return this.productService.findByTenant(context.tenantId);
  }
}
```

### 场景2：大型企业多组织管理

```typescript
// 组织级数据隔离
@Controller("employees")
export class EmployeeController {
  @Get()
  @RequireOrganization() // 要求组织上下文
  async getEmployees(@CurrentContext() context: IsolationContext) {
    // 只返回当前组织的员工
    return this.empService.findByOrganization(
      context.tenantId,
      context.organizationId,
    );
  }
}
```

### 场景3：部门独立管理

```typescript
// 部门级数据隔离
@Controller("documents")
export class DocumentController {
  @Get()
  @RequireDepartment() // 要求部门上下文
  async getDocuments(@CurrentContext() context: IsolationContext) {
    // 只返回当前部门的文档
    return this.docService.findByDepartment(
      context.tenantId,
      context.organizationId,
      context.departmentId,
    );
  }
}
```

### 场景4：个人数据隔离

```typescript
// 用户级数据隔离
@Controller("notes")
export class NoteController {
  @Get()
  async getMyNotes(@CurrentContext() context: IsolationContext) {
    if (context.isUserLevel()) {
      // 返回个人笔记
      return this.noteService.findByUser(context.userId);
    } else if (context.isTenantLevel()) {
      // 返回租户共享笔记
      return this.noteService.findShared(context.tenantId);
    }
    // ...
  }
}
```

### 场景5：系统管理

```typescript
// 平台级，无隔离
@Controller("admin/stats")
export class AdminController {
  @Get()
  async getStats(@CurrentContext() context: IsolationContext) {
    if (!context.isPlatformLevel()) {
      throw new ForbiddenException("仅系统管理员可访问");
    }
    // 返回全局统计数据
    return this.statsService.getGlobalStats();
  }
}
```

---

## 🔗 与其他模块集成

### 与 @hl8/exceptions 集成

```typescript
import { GeneralNotFoundException } from "@hl8/exceptions";
import { RequireTenant, CurrentContext } from "@hl8/nestjs-isolation";

@Controller("users")
export class UserController {
  @Get(":id")
  @RequireTenant()
  async getUser(
    @Param("id") id: string,
    @CurrentContext() context: IsolationContext,
  ) {
    const user = await this.userService.findOne(id, context.tenantId);

    if (!user) {
      throw new GeneralNotFoundException(
        "用户未找到",
        `租户 ${context.tenantId?.value} 中不存在 ID 为 ${id} 的用户`,
        { userId: id, tenantId: context.tenantId?.value },
      );
    }

    return user;
  }
}
```

### 与数据库集成

```typescript
// 使用 TypeORM
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly isolationContext: IsolationContextService,
  ) {}

  async findAll() {
    const context = this.isolationContext.getContext();

    const query = this.repo.createQueryBuilder("user");

    // 根据隔离级别添加 WHERE 条件
    if (context.isTenantLevel()) {
      query.where("user.tenantId = :tenantId", {
        tenantId: context.tenantId?.value,
      });
    }

    if (context.isOrganizationLevel()) {
      query.where("user.tenantId = :tenantId", {
        tenantId: context.tenantId?.value,
      });
      query.andWhere("user.organizationId = :orgId", {
        orgId: context.organizationId?.value,
      });
    }

    return query.getMany();
  }
}
```

### 与日志集成

```typescript
import { FastifyLoggerService } from "@hl8/nestjs-fastify/index.js";
import { IsolationContextService } from "@hl8/nestjs-isolation";

@Injectable()
export class AuditService {
  constructor(
    private readonly logger: FastifyLoggerService,
    private readonly isolationContext: IsolationContextService,
  ) {}

  async logAction(action: string) {
    const context = this.isolationContext.getContext();

    this.logger.info("User action", {
      action,
      level: context.level,
      tenantId: context.tenantId?.value,
      organizationId: context.organizationId?.value,
      userId: context.userId?.value,
    });
  }
}
```

---

## ❓ 常见问题

### Q1: 为什么不需要配置选项？

**A**: 本模块采用约定优于配置的设计理念：

- 请求头名称是标准化的（`X-Tenant-Id`、`X-Organization-Id` 等）
- 自动从请求头提取上下文
- 基于 nestjs-cls 自动管理请求级上下文
- 全局模块，注册一次全局可用

如果需要自定义，可以：

- 使用中间件修改请求头
- 继承服务类实现自定义逻辑

---

### Q2: 如何在服务中获取隔离上下文？

**A**: 有两种方式：

**方式1：注入 IsolationContextService**

```typescript
@Injectable()
export class UserService {
  constructor(private readonly isolationContext: IsolationContextService) {}

  async findUsers() {
    const context = this.isolationContext.getContext();
    // 使用 context
  }
}
```

**方式2：在控制器中获取后传递**

```typescript
@Get()
async getUsers(@CurrentContext() context: IsolationContext) {
  return this.userService.findUsers(context);
}
```

---

### Q3: 请求头丢失或格式错误会怎样？

**A**:

- **不影响请求执行**：降级到平台级（Platform Level）
- **装饰器保护**：如果使用了 `@RequireTenant()` 等装饰器，会返回 403
- **验证失败**：ID 格式错误时也会降级到平台级

```typescript
// 没有请求头或格式错误
context.level === IsolationLevel.PLATFORM; // true
context.tenantId === undefined; // true
```

---

### Q4: 如何支持自定义请求头名称？

**A**: 目前不支持自定义请求头名称。如果需要，可以：

1. **使用中间件映射**：

```typescript
@Injectable()
export class HeaderMapperMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // 映射自定义请求头到标准请求头
    if (req.headers["custom-tenant"]) {
      req.headers["x-tenant-id"] = req.headers["custom-tenant"];
    }
    next();
  }
}
```

2. **提交 PR**：欢迎贡献代码支持自定义配置

---

### Q5: 隔离上下文在整个请求生命周期中是否一致？

**A**: 是的，完全一致。

- 基于 nestjs-cls 实现
- 请求级上下文，线程安全
- 在控制器、服务、Repository 等任何地方获取的都是同一个上下文

---

### Q6: 性能开销如何？

**A**: 非常小：

- 只在请求开始时提取一次上下文
- 存储在 CLS（Continuation Local Storage）中
- 后续访问是内存读取，几乎零开销
- 不影响请求处理速度

---

## 🎨 最佳实践

### 1. 在控制器层使用装饰器

```typescript
// ✅ 好的做法
@Controller("users")
export class UserController {
  @Get()
  @RequireTenant() // 明确要求隔离级别
  async getUsers(@CurrentContext() context: IsolationContext) {
    return this.userService.findByContext(context);
  }
}

// ❌ 不推荐
@Controller("users")
export class UserController {
  @Get()
  async getUsers() {
    // 没有明确隔离级别要求，容易出错
    return this.userService.findAll();
  }
}
```

---

### 2. 在服务层验证隔离级别

```typescript
// ✅ 好的做法
@Injectable()
export class UserService {
  async findByContext(context: IsolationContext) {
    if (!context.isTenantLevel()) {
      throw new BadRequestException("需要租户上下文");
    }

    return this.repo.find({
      where: { tenantId: context.tenantId.value },
    });
  }
}
```

---

### 3. 使用类型安全的方式访问 ID

```typescript
// ✅ 好的做法
if (context.tenantId) {
  const id = context.tenantId.value; // 类型安全
  // 使用 id
}

// ❌ 避免
const id = context.tenantId?.value || "default"; // 不应该有默认值
```

---

### 4. 在数据库查询中应用隔离

```typescript
// ✅ 好的做法
@Injectable()
export class Repository {
  async findAll(context: IsolationContext) {
    const query = this.createQueryBuilder();

    // 根据隔离级别添加条件
    if (context.isTenantLevel()) {
      query.where("tenantId = :tid", { tid: context.tenantId.value });
    }

    if (context.isOrganizationLevel()) {
      query.andWhere("organizationId = :oid", {
        oid: context.organizationId.value,
      });
    }

    return query.getMany();
  }
}
```

---

### 5. 在日志中包含隔离上下文

```typescript
// ✅ 好的做法
this.logger.info("User action", {
  action: "login",
  level: context.level,
  tenantId: context.tenantId?.value,
  organizationId: context.organizationId?.value,
});

// 便于问题排查和审计
```

---

## 🏗️ 架构设计

### 依赖关系

本库依赖于纯领域模型库 `@hl8/isolation-model`，遵循依赖倒置原则：

```
业务代码（Controllers, Services）
  ↓ 使用
@hl8/nestjs-isolation（NestJS 实现）
  ↓ 依赖
@hl8/isolation-model（纯领域模型，零依赖）
```

### 模块结构

```
libs/nestjs-isolation/src/
├── decorators/              # 装饰器
│   ├── current-context.decorator.ts    # @CurrentContext()
│   └── require-level.decorator.ts      # @RequireTenant() 等
│
├── guards/                  # 守卫
│   └── isolation.guard.ts              # 隔离级别验证
│
├── middleware/              # 中间件
│   └── isolation-extraction.middleware.ts  # 上下文提取
│
├── services/                # 服务
│   ├── isolation-context.service.ts         # 上下文服务
│   └── multi-level-isolation.service.ts     # 多级隔离服务
│
└── isolation.module.ts      # 主模块
```

### 工作流程

```
1. 请求到达
   ↓
2. nestjs-cls 中间件创建 CLS 上下文
   ↓
3. IsolationModule 从请求头提取隔离信息
   ↓
4. 创建 IsolationContext 并存储到 CLS
   ↓
5. 控制器/服务通过装饰器或服务获取上下文
   ↓
6. 守卫验证隔离级别
   ↓
7. 业务逻辑使用上下文进行数据隔离
   ↓
8. 请求结束，CLS 上下文自动清理
```

---

## 📈 性能考虑

### 上下文提取开销

- **提取时机**：仅在请求开始时提取一次
- **存储方式**：存储在内存中的 CLS
- **访问开销**：几乎为零（内存读取）
- **对吞吐量影响**：< 1%

### 装饰器开销

- **编译时**：装饰器在编译时处理，运行时无开销
- **守卫执行**：每个路由仅执行一次验证
- **总开销**：可忽略不计

### 优化建议

1. **缓存上下文**：在服务中获取后可以缓存在局部变量
2. **避免重复验证**：使用装饰器统一验证，不要在每个方法中重复验证
3. **数据库查询优化**：为隔离字段添加索引

```sql
-- 为隔离字段添加索引
CREATE INDEX idx_tenant_id ON users(tenant_id);
CREATE INDEX idx_org_id ON users(organization_id);
```

---

## 📚 相关链接

### 项目文档

- [完整文档](../../specs/001-hl8-nestjs-enhance/isolation-quickstart.md)
- [领域模型库](../isolation-model)
- [API 参考](../../specs/001-hl8-nestjs-enhance/contracts/isolation-api.md)

### 相关模块

- [@hl8/isolation-model](../isolation-model) - 纯领域模型
- [@hl8/exceptions](../exceptions) - 异常处理
- [@hl8/nestjs-fastify](../nestjs-fastify) - Fastify 增强

### 外部资源

- [nestjs-cls](https://github.com/Papooch/nestjs-cls) - CLS 上下文管理
- [NestJS Guards](https://docs.nestjs.com/guards) - NestJS 守卫文档
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/category/multi-tenancy) - 多租户架构模式

---

## 📄 License

MIT © HL8 Team
