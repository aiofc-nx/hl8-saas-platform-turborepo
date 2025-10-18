# 应用层单元测试文档

## 概述

本文档描述了 `libs/business-core` 应用层的单元测试实现，包括测试覆盖范围、测试策略和运行指南。

## 测试覆盖范围

### 1. 用例测试 (Use Cases)

#### 组织用例测试

- ✅ `create-organization.use-case.spec.ts` - 创建组织用例测试
- ✅ `get-organization.use-case.spec.ts` - 获取组织用例测试
- ✅ `get-organizations.use-case.spec.ts` - 获取组织列表用例测试
- ✅ `update-organization.use-case.spec.ts` - 更新组织用例测试
- ✅ `delete-organization.use-case.spec.ts` - 删除组织用例测试

#### 部门用例测试

- ✅ `create-department.use-case.spec.ts` - 创建部门用例测试
- ✅ `get-department.use-case.spec.ts` - 获取部门用例测试
- ✅ `get-departments.use-case.spec.ts` - 获取部门列表用例测试
- ✅ `update-department.use-case.spec.ts` - 更新部门用例测试
- ✅ `delete-department.use-case.spec.ts` - 删除部门用例测试

#### 角色用例测试

- ✅ `create-role.use-case.spec.ts` - 创建角色用例测试

#### 用户用例测试

- ✅ `activate-user.use-case.spec.ts` - 激活用户用例测试
- ✅ `deactivate-user.use-case.spec.ts` - 停用用户用例测试
- ✅ `delete-user.use-case.spec.ts` - 删除用户用例测试
- ✅ `get-user-list.use-case.spec.ts` - 获取用户列表用例测试

### 2. 应用服务测试 (Application Services)

- ✅ `user-application.service.spec.ts` - 用户应用服务测试
- ✅ `organization-application.service.spec.ts` - 组织应用服务测试

### 3. 通用模块测试 (Common Modules)

- ✅ `business.exceptions.spec.ts` - 业务异常测试
- ✅ `application.exception.spec.ts` - 应用异常测试

## 测试策略

### 测试场景覆盖

每个测试文件都包含以下测试场景：

#### 成功场景

- 基本功能测试
- 数据验证和转换
- 权限验证
- 缓存处理
- 事件发布
- 性能测试

#### 失败场景

- 输入验证失败
- 业务规则违反
- 权限不足
- 资源不存在
- 数据重复

#### 错误处理

- 仓储操作失败
- 事件发布失败
- 缓存服务失败
- 事务管理失败

### 测试基础设施

#### 模拟对象 (Mock Objects)

- `MockUserRepository` - 模拟用户仓储
- `MockOrganizationRepository` - 模拟组织仓储
- `MockDepartmentRepository` - 模拟部门仓储
- `MockRoleRepository` - 模拟角色仓储
- `MockCacheService` - 模拟缓存服务
- `MockEventBus` - 模拟事件总线
- `MockTransactionManager` - 模拟事务管理器
- `MockLoggerService` - 模拟日志服务
- `MockUserUseCaseServices` - 模拟用户用例服务
- `MockTenantUseCaseServices` - 模拟租户用例服务
- `MockOrganizationUseCaseServices` - 模拟组织用例服务
- `MockDepartmentUseCaseServices` - 模拟部门用例服务

#### 测试数据工厂 (Test Data Factory)

- `TestDataFactory` - 提供各种测试数据的工厂方法
- 支持用户、组织、部门、角色等测试数据创建
- 提供有效和无效的测试数据变体

## 运行测试

### 运行所有测试

```bash
# 运行所有应用层测试
npm test -- --testPathPattern="application"

# 运行特定模块测试
npm test -- --testPathPattern="use-cases"
npm test -- --testPathPattern="services"
npm test -- --testPathPattern="common"
```

### 运行测试脚本

```bash
# 运行测试脚本
chmod +x run-tests.sh
./run-tests.sh

# 生成覆盖率报告
chmod +x coverage-report.sh
./coverage-report.sh
```

### 测试覆盖率

目标覆盖率：≥ 80%

```bash
# 生成覆盖率报告
npm test -- --coverage --testPathPattern="application"
```

## 测试文件结构

```
libs/business-core/src/application/
├── __tests__/
│   └── test-utils/
│       ├── mock-repositories.ts    # 模拟仓储
│       ├── mock-services.ts        # 模拟服务
│       └── test-data.ts            # 测试数据工厂
├── use-cases/
│   ├── organization/
│   │   ├── create-organization.use-case.spec.ts
│   │   ├── get-organization.use-case.spec.ts
│   │   ├── get-organizations.use-case.spec.ts
│   │   ├── update-organization.use-case.spec.ts
│   │   └── delete-organization.use-case.spec.ts
│   ├── department/
│   │   ├── create-department.use-case.spec.ts
│   │   ├── get-department.use-case.spec.ts
│   │   ├── get-departments.use-case.spec.ts
│   │   ├── update-department.use-case.spec.ts
│   │   └── delete-department.use-case.spec.ts
│   ├── role/
│   │   └── create-role.use-case.spec.ts
│   └── user/
│       ├── activate-user.use-case.spec.ts
│       ├── deactivate-user.use-case.spec.ts
│       ├── delete-user.use-case.spec.ts
│       └── get-user-list.use-case.spec.ts
├── services/
│   ├── user-application.service.spec.ts
│   └── organization-application.service.spec.ts
└── common/
    └── exceptions/
        ├── business.exceptions.spec.ts
        └── application.exception.spec.ts
```

## 测试最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "应该...当..." 的命名模式
- 使用中文描述业务场景

### 2. 测试组织

- 按功能模块组织测试
- 使用 `describe` 和 `it` 进行层次化组织
- 每个测试文件专注于一个功能模块

### 3. 测试数据

- 使用测试数据工厂创建测试数据
- 提供多种测试数据变体
- 避免硬编码测试数据

### 4. 模拟对象

- 使用模拟对象隔离外部依赖
- 提供完整的模拟对象实现
- 支持测试场景的灵活配置

### 5. 断言

- 使用明确的断言
- 验证所有重要的业务逻辑
- 包含边界条件和异常情况

## 持续集成

### CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:coverage:check
```

### 覆盖率检查

```json
// package.json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:coverage:check": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'"
  }
}
```

## 故障排除

### 常见问题

1. **模拟对象类型错误**
   - 检查模拟对象的接口实现
   - 确保所有必需的方法都已实现

2. **测试数据问题**
   - 检查测试数据工厂的实现
   - 确保测试数据符合业务规则

3. **异步测试问题**
   - 使用 `async/await` 处理异步操作
   - 确保所有异步操作都正确等待

4. **覆盖率问题**
   - 检查测试覆盖的业务逻辑
   - 添加缺失的测试场景

### 调试技巧

1. **使用调试器**

   ```bash
   npm test -- --testNamePattern="特定测试" --verbose
   ```

2. **查看测试输出**

   ```bash
   npm test -- --testPathPattern="application" --verbose
   ```

3. **检查覆盖率详情**
   ```bash
   npm test -- --coverage --testPathPattern="application" --coverageReporters=text
   ```

## 总结

本测试套件为应用层提供了全面的单元测试覆盖，包括：

- **19个测试文件**，覆盖所有主要功能模块
- **完整的测试基础设施**，包括模拟对象和测试数据工厂
- **全面的测试场景**，包括成功、失败和错误处理
- **良好的测试组织**，便于维护和扩展
- **详细的文档**，便于团队协作

通过这个测试套件，我们可以确保应用层的业务逻辑正确性和可靠性，为项目的质量保证提供坚实的基础。
