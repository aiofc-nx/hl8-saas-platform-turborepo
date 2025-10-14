# Changelog

本文档记录 hybrid-archi 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.1.0] - 2025-10-10

### 🎉 Added (新增)

#### 通用值对象库 (OPT-003)

- **Code** - 通用代码值对象抽象基类
- **Domain** - 通用域名值对象抽象基类
- **Level** - 通用级别值对象抽象基类
- **Name** - 通用名称值对象抽象基类
- **Description** - 通用描述值对象抽象基类

文件位置: `src/domain/value-objects/common/`

#### 验证辅助方法

- `validateNotEmpty(value, fieldName)` - 非空验证
- `validateLength(value, min, max, fieldName)` - 长度验证
- `validatePattern(value, pattern, message)` - 正则验证
- `validateRange(value, min, max, fieldName)` - 范围验证
- `validateInteger(value, fieldName)` - 整数验证
- `validatePositive(value, fieldName)` - 正数验证
- `validateEnum(value, allowedValues, fieldName)` - 枚举验证

### 🔄 Changed (变更)

#### BaseValueObject 泛型化 (OPT-002)

- **破坏性变更**: BaseValueObject 现在需要泛型参数 `<T>`
- 自动提供 `value` getter 属性
- 自动提供 `static create<V>()` 方法
- 新增 `validate(value: T)` 抽象方法
- 新增 `transform(value: T)` 可选方法

**迁移影响**: 所有继承 BaseValueObject 的类需要添加泛型参数

#### 值对象迁移到新 API

- Email → `BaseValueObject<string>`
- Username → `BaseValueObject<string>`
- PhoneNumber → `BaseValueObject<string>`
- Password → `BaseValueObject<string>`
- PasswordPolicy → `BaseValueObject<PasswordPolicyProps>`

**收益**: 样板代码减少 50-60%

#### CLI BaseCommand 重命名 (OPT-001)

- **破坏性变更**: `BaseCommand` → `CliBaseCommand`
- 原因: 避免与 CQRS BaseCommand 命名冲突

**迁移影响**: 所有 CLI 命令类需要更新导入和继承

#### 移除 CQRS 别名

- **简化**: `CqrsBaseCommand` → `BaseCommand`
- **简化**: `CqrsBaseQuery` → `BaseQuery`
- 原因: CLI BaseCommand 已重命名，不再需要别名

**迁移影响**: 全局替换导入语句

### ❌ Removed (移除)

#### 业务特定组件 (OPT-004)

- **TenantStatus** - 已移至 `@hl8/saas-core`
  - 文件: `src/domain/value-objects/statuses/tenant-status.vo.ts`
  - 测试: `src/domain/value-objects/statuses/tenant-status.vo.spec.ts`
- **OrganizationStatus** - 已移至 `@hl8/saas-core`
  - 文件: `src/domain/value-objects/statuses/organization-status.vo.ts`

**原因**: hybrid-archi 是架构基础库，不应包含业务特定概念

**迁移影响**:

- 如使用 saas-core: 从 `@hl8/saas-core` 导入
- 如其他项目: 在业务模块中自行创建

### 🔧 Fixed (修复)

- 修复 BaseValueObject 类型安全问题
- 修复验证逻辑一致性
- 修复命名冲突

---

## [1.0.0] - 2025-10-01

### 🎉 Added

#### 核心组件

- BaseEntity - 基础实体类
- BaseAggregateRoot - 基础聚合根类
- BaseValueObject - 基础值对象类（v1.0 API）
- BaseDomainEvent - 基础领域事件类
- TenantAwareAggregateRoot - 租户感知聚合根

#### CQRS 组件

- CommandBus - 命令总线
- QueryBus - 查询总线
- EventBus - 事件总线
- BaseCommand (CQRS) - 命令基类（别名 CqrsBaseCommand）
- BaseQuery - 查询基类（别名 CqrsBaseQuery）

#### 接口层组件

- BaseController - REST 控制器基类
- BaseResolver - GraphQL 解析器基类
- BaseGateway - WebSocket 网关基类
- BaseCommand (CLI) - CLI 命令基类
- 守卫、装饰器、管道、中间件

#### 值对象

- EntityId - 实体唯一标识符
- Email - 邮箱验证（v1.0 API）
- Username - 用户名验证（v1.0 API）
- PhoneNumber - 电话号码验证（v1.0 API）
- Password - 密码验证（v1.0 API）
- UserStatus - 用户状态枚举
- TenantStatus - 租户状态枚举
- OrganizationStatus - 组织状态枚举
- PasswordPolicy - 密码策略（v1.0 API）
- MfaType - MFA 类型枚举
- MfaStatus - MFA 状态枚举

#### 基础设施组件

- 缓存适配器
- 数据库适配器
- 消息队列适配器
- 事件存储
- 端口适配器

---

## 升级指南

### 从 v1.0.0 升级到 v1.1.0

请参阅 [MIGRATION-GUIDE-v1.1.md](./MIGRATION-GUIDE-v1.1.md)

### 主要步骤

1. 更新所有 BaseValueObject 为泛型版本
2. 更新 CLI 命令: BaseCommand → CliBaseCommand
3. 更新 CQRS: CqrsBaseCommand/Query → BaseCommand/Query
4. 更新业务状态导入路径
5. 运行测试验证

---

## 链接

- [迁移指南](./MIGRATION-GUIDE-v1.1.md)
- [值对象文档](./src/domain/value-objects/README.md)
- [优化记录](../../specs/002-hybrid-archi-optimization/)

---

**维护团队**: HL8 架构团队  
**最后更新**: 2025-10-10
