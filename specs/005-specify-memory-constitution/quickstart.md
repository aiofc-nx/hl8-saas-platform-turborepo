# 快速开始指南: SAAS 平台核心模块重构

**Feature**: SAAS 平台核心模块重构  
**Date**: 2025-01-27  
**Branch**: `005-specify-memory-constitution`

## 概述

本指南将帮助您快速了解和使用 SAAS 平台核心模块重构功能。重构旨在建立清晰的模块边界，提升代码的可维护性和可扩展性。

## 前置条件

### 系统要求

- Node.js >= 20
- pnpm 10.11.0
- TypeScript 5.9.2
- Git

### 环境设置

```bash
# 克隆项目
git clone https://github.com/hl8/hl8-saas-platform-turborepo.git
cd hl8-saas-platform-turborepo

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

## 核心概念

### 模块架构

重构涉及三个核心模块：

1. **hybrid-archi**: 架构基础库
   - 提供通用架构组件（BaseEntity、BaseAggregateRoot、CQRS组件等）
   - 保持纯粹的架构基础库定位
   - 不包含业务特定组件

2. **libs/isolation-model**: 隔离模型模块
   - 提供多层级数据隔离的领域模型
   - 与 hybrid-archi domain 层存在重叠内容
   - 需要特别处理重叠部分

3. **saas-core**: SAAS 核心业务模块
   - 实现 SAAS 平台的核心业务功能
   - 包含多租户管理、用户管理、组织架构、角色权限等
   - 适配新的基础设施模块

### 基础设施模块

新的基础设施模块包括：

- `@hl8/database`: 数据库操作和 ORM 支持
- `@hl8/caching`: 缓存管理和策略
- `@hl8/nestjs-fastify/logging`: 基于 NestJS 和 Fastify 的日志服务
- `@hl8/nestjs-isolation`: 多租户隔离和数据隔离支持
- `@hl8/exceptions`: 统一异常处理和错误管理

## 快速开始

### 1. 分析模块重叠内容

首先分析 `libs/isolation-model` 与 `hybrid-archi` 的重叠内容：

```bash
# 使用 API 分析重叠内容
curl -X POST https://api.hl8.com/v1/modules/analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sourceModule": "hybrid-archi",
    "targetModule": "isolation-model",
    "analysisType": "domain-layer",
    "options": {
      "includeTests": true,
      "includeDocumentation": true,
      "depth": 3
    }
  }'
```

### 2. 清理 hybrid-archi 业务特定组件

移除业务特定组件：

```bash
# 清理业务特定组件
curl -X POST https://api.hl8.com/v1/modules/hybrid-archi/clean \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "moduleName": "hybrid-archi",
    "componentsToRemove": ["TenantStatus", "OrganizationStatus"],
    "migrationTarget": "saas-core",
    "options": {
      "backupBeforeClean": true,
      "validateAfterClean": true
    }
  }'
```

### 3. 迁移 CommonJS 到 NodeNext 模块系统

更新模块系统配置：

```bash
# 更新 package.json 配置
curl -X POST https://api.hl8.com/v1/modules/migrate-module-system \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "moduleName": "hybrid-archi",
    "fromModuleSystem": "CommonJS",
    "toModuleSystem": "NodeNext",
    "options": {
      "updatePackageJson": true,
      "updateTsConfig": true,
      "updateImportSyntax": true,
      "validateCompilation": true
    }
  }'
```

### 4. 更新 saas-core 依赖配置

适配新的基础设施模块：

```bash
# 更新依赖配置
curl -X PUT https://api.hl8.com/v1/modules/saas-core/dependencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "moduleName": "saas-core",
    "oldDependencies": [
      "@hl8/database",
      "@hl8/cache",
      "@hl8/logger",
      "@hl8/multi-tenancy"
    ],
    "newDependencies": [
      "@hl8/database",
      "@hl8/caching",
      "@hl8/nestjs-fastify/logging",
      "@hl8/nestjs-isolation",
      "@hl8/exceptions"
    ],
    "options": {
      "validateCompatibility": true,
      "updateTests": true,
      "updateDocumentation": true
    }
  }'
```

### 4. 验证重构结果

验证重构后的功能和边界：

```bash
# 验证重构结果
curl -X POST https://api.hl8.com/v1/refactoring/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "validationType": "functionality",
    "modules": ["hybrid-archi", "saas-core", "isolation-model"],
    "options": {
      "includePerformance": true,
      "includeIntegration": true,
      "testCoverage": 80
    }
  }'
```

## 使用示例

### TypeScript 代码示例

#### CommonJS 到 NodeNext 迁移示例

**迁移前（CommonJS）**：

```typescript
// 旧的 CommonJS 语法
const { BaseEntity } = require("@hl8/hybrid-archi");
const { UserService } = require("./user.service");
const { DatabaseConfig } = require("./config/database");

module.exports = {
  UserController,
  UserService,
};
```

**迁移后（NodeNext）**：

```typescript
// 新的 ES 模块语法
import { BaseEntity, EntityId } from "@hl8/hybrid-archi";
import { UserService } from "./user.service.js";
import { DatabaseConfig } from "./config/database.js";

export { UserController, UserService };
```

**package.json 配置更新**：

```json
{
  "name": "@hl8/hybrid-archi",
  "version": "1.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

**tsconfig.json 配置更新**：

```json
{
  "extends": "@repo/ts-config/nestjs.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022"
  }
}
```

#### 使用 hybrid-archi 基础组件

```typescript
import {
  BaseEntity,
  BaseAggregateRoot,
  BaseValueObject,
  CommandBus,
  QueryBus,
  EntityId,
  Email,
  Username,
} from "@hl8/hybrid-archi";

/**
 * 用户聚合根示例
 *
 * @description 演示如何使用 hybrid-archi 的基础组件
 * 创建符合 DDD 和 Clean Architecture 的用户聚合根
 */
export class UserAggregate extends BaseAggregateRoot {
  constructor(
    id: EntityId,
    private username: Username,
    private email: Email,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
  }

  /**
   * 创建用户聚合根
   *
   * @param username 用户名
   * @param email 邮箱地址
   * @param auditInfo 审计信息
   * @returns 用户聚合根实例
   */
  public static create(
    username: string,
    email: string,
    auditInfo: IPartialAuditInfo,
  ): UserAggregate {
    const id = EntityId.generate();
    const usernameVO = Username.create(username);
    const emailVO = Email.create(email);

    return new UserAggregate(id, usernameVO, emailVO, auditInfo);
  }

  /**
   * 更新用户邮箱
   *
   * @param newEmail 新邮箱地址
   */
  public updateEmail(newEmail: string): void {
    const emailVO = Email.create(newEmail);
    this.email = emailVO;
    this.updateTimestamp();

    // 发布领域事件
    this.addDomainEvent(new UserEmailUpdatedEvent(this.id, emailVO));
  }
}
```

#### 使用 isolation-model 隔离组件

```typescript
import {
  TenantIsolation,
  OrganizationIsolation,
  DepartmentIsolation,
  UserIsolation,
  AccessContext,
} from "@hl8/isolation-model/index.js";

/**
 * 数据隔离服务示例
 *
 * @description 演示如何使用 isolation-model 实现多层级数据隔离
 */
export class DataIsolationService {
  constructor(
    private readonly tenantIsolation: TenantIsolation,
    private readonly organizationIsolation: OrganizationIsolation,
    private readonly departmentIsolation: DepartmentIsolation,
    private readonly userIsolation: UserIsolation,
  ) {}

  /**
   * 创建访问上下文
   *
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param departmentId 部门ID
   * @param userId 用户ID
   * @returns 访问上下文
   */
  public createAccessContext(
    tenantId: string,
    organizationId: string,
    departmentId: string,
    userId: string,
  ): AccessContext {
    return new AccessContext({
      tenantId,
      organizationId,
      departmentId,
      userId,
      isolationLevel: "department", // 部门级隔离
      accessPermissions: ["read", "write"],
    });
  }

  /**
   * 验证数据访问权限
   *
   * @param context 访问上下文
   * @param resourceId 资源ID
   * @returns 是否允许访问
   */
  public validateAccess(context: AccessContext, resourceId: string): boolean {
    // 实现多层级隔离验证逻辑
    return this.userIsolation.canAccess(context, resourceId);
  }
}
```

#### 使用 saas-core 业务组件

```typescript
import {
  TenantAggregate,
  UserAggregate,
  OrganizationAggregate,
  DepartmentAggregate,
  RoleAggregate,
  PermissionAggregate,
} from "@hl8/saas-core";

/**
 * SAAS 业务服务示例
 *
 * @description 演示如何使用 saas-core 的业务组件
 * 实现完整的 SAAS 平台业务逻辑
 */
export class SaasBusinessService {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly userRepository: IUserRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  /**
   * 创建租户
   *
   * @param tenantData 租户数据
   * @returns 租户聚合根
   */
  public async createTenant(
    tenantData: CreateTenantDto,
  ): Promise<TenantAggregate> {
    // 使用 saas-core 的租户聚合根
    const tenant = TenantAggregate.create(
      EntityId.generate(),
      TenantCode.create(tenantData.code),
      tenantData.name,
      TenantDomain.create(tenantData.domain),
      TenantType[tenantData.type],
      { createdBy: tenantData.createdBy },
    );

    // 持久化到数据库
    await this.tenantRepository.save(tenant);

    return tenant;
  }

  /**
   * 创建用户
   *
   * @param userData 用户数据
   * @param tenantId 租户ID
   * @returns 用户聚合根
   */
  public async createUser(
    userData: CreateUserDto,
    tenantId: string,
  ): Promise<UserAggregate> {
    // 使用 hybrid-archi 的基础组件和 saas-core 的业务组件
    const user = UserAggregate.create(
      EntityId.generate(),
      Username.create(userData.username),
      Email.create(userData.email),
      PhoneNumber.create(userData.phoneNumber),
      userData.passwordHash,
      userData.passwordSalt,
      { createdBy: userData.createdBy, tenantId },
    );

    // 持久化到数据库
    await this.userRepository.save(user);

    return user;
  }
}
```

## 测试指南

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
pnpm test:hybrid-archi
pnpm test:saas-core
pnpm test:isolation-model

# 运行集成测试
pnpm test:integration

# 运行 E2E 测试
pnpm test:e2e

# 检查测试覆盖率
pnpm test:coverage
```

### 测试示例

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserAggregate } from "@hl8/saas-core";
import { EntityId, Username, Email } from "@hl8/hybrid-archi";

describe("UserAggregate", () => {
  let user: UserAggregate;

  beforeEach(() => {
    const id = EntityId.generate();
    const username = Username.create("testuser");
    const email = Email.create("test@example.com");

    user = UserAggregate.create(id, username, email, {
      createdBy: "system",
      createdAt: new Date(),
    });
  });

  it("应该正确创建用户聚合根", () => {
    expect(user).toBeDefined();
    expect(user.getId()).toBeDefined();
    expect(user.getUsername().getValue()).toBe("testuser");
    expect(user.getEmail().getValue()).toBe("test@example.com");
  });

  it("应该能够更新用户邮箱", () => {
    const newEmail = "newemail@example.com";

    user.updateEmail(newEmail);

    expect(user.getEmail().getValue()).toBe(newEmail);
    expect(user.getDomainEvents()).toHaveLength(1);
  });
});
```

## 监控和调试

### 查看重构状态

```bash
# 获取重构状态
curl -X GET https://api.hl8.com/v1/refactoring/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 日志查看

```bash
# 查看重构日志
pnpm logs:refactoring

# 查看特定模块日志
pnpm logs:hybrid-archi
pnpm logs:saas-core
pnpm logs:isolation-model
```

### 性能监控

```bash
# 启动性能监控
pnpm monitor:start

# 查看性能指标
pnpm monitor:metrics

# 生成性能报告
pnpm monitor:report
```

## 故障排除

### 常见问题

1. **模块依赖冲突**

   ```bash
   # 检查依赖冲突
   pnpm list --depth=0

   # 解决依赖冲突
   pnpm install --force
   ```

2. **测试失败**

   ```bash
   # 运行特定测试
   pnpm test --testNamePattern="UserAggregate"

   # 查看详细错误信息
   pnpm test --verbose
   ```

3. **构建失败**

   ```bash
   # 清理构建缓存
   pnpm clean

   # 重新构建
   pnpm build
   ```

### 获取帮助

- 查看文档: `docs/guides/`
- 提交问题: GitHub Issues
- 联系团队: dev@hl8.com

## 最佳实践

1. **遵循架构原则**: 确保代码符合 Clean Architecture + DDD + CQRS + ES + EDA
2. **使用统一术语**: 参考 `docs/definition-of-terms.mdc`
3. **完善注释**: 遵循 TSDoc 规范，使用中文注释
4. **编写测试**: 确保测试覆盖率达到 80% 以上
5. **持续集成**: 每次提交都运行完整的测试套件

## 下一步

- 查看 [数据模型设计](./data-model.md) 了解详细的数据结构
- 查看 [API 合约](./contracts/module-refactoring-api.yaml) 了解完整的 API 规范
- 查看 [研究结果](./research.md) 了解技术决策的详细分析
