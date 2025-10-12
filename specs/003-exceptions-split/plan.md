# Exceptions 模块拆分 - 实施计划

## 1. 项目信息

| 项目         | 说明                                    |
| ------------ | --------------------------------------- |
| **功能名称** | Exceptions 模块拆分                     |
| **库名称**   | `@hl8/nestjs-exceptions`                |
| **版本**     | 0.1.0                                   |
| **分支**     | 003-exceptions-split                    |
| **工作量**   | 6-9 小时（1 个工作日）                  |

## 2. 技术栈

### 2.1 核心技术

| 技术         | 版本   | 用途                     |
| ------------ | ------ | ------------------------ |
| Node.js      | 20+    | 运行时                   |
| TypeScript   | 5.7+   | 开发语言                 |
| NestJS       | 10+    | 框架                     |
| Jest         | 29+    | 测试框架                 |
| SWC          | 1.3+   | 编译器                   |

### 2.2 依赖包

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@swc/cli": "^0.5.0",
    "@swc/core": "^1.10.6",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.13.5",
    "jest": "^29.7.0",
    "typescript": "^5.7.3"
  }
}
```

## 3. 架构设计

### 3.1 目录结构

```
libs/nestjs-exceptions/
├── src/
│   ├── core/                         # 核心异常类
│   │   ├── abstract-http.exception.ts
│   │   ├── abstract-http.exception.spec.ts
│   │   ├── general-bad-request.exception.ts
│   │   ├── general-bad-request.exception.spec.ts
│   │   ├── general-not-found.exception.ts
│   │   ├── general-not-found.exception.spec.ts
│   │   ├── general-internal-server.exception.ts
│   │   ├── general-internal-server.exception.spec.ts
│   │   ├── invalid-isolation-context.exception.ts
│   │   ├── invalid-isolation-context.exception.spec.ts
│   │   ├── tenant-not-found.exception.ts
│   │   ├── tenant-not-found.exception.spec.ts
│   │   ├── unauthorized-organization.exception.ts
│   │   ├── unauthorized-organization.exception.spec.ts
│   │   └── index.ts
│   ├── filters/                      # 异常过滤器
│   │   ├── http-exception.filter.ts
│   │   ├── http-exception.filter.spec.ts
│   │   ├── any-exception.filter.ts
│   │   ├── any-exception.filter.spec.ts
│   │   └── index.ts
│   ├── providers/                    # 消息提供器
│   │   ├── exception-message.provider.ts
│   │   ├── default-message.provider.ts
│   │   ├── default-message.provider.spec.ts
│   │   └── index.ts
│   ├── config/                       # 配置
│   │   ├── exception.config.ts
│   │   └── index.ts
│   ├── exception.module.ts           # 异常模块
│   └── index.ts                      # 主导出文件
├── package.json                      # 包配置
├── tsconfig.json                     # TS 配置
├── jest.config.ts                    # Jest 配置
├── .swcrc                            # SWC 配置
├── README.md                         # 文档
└── CHANGELOG.md                      # 变更日志
```

### 3.2 模块依赖关系

```
@hl8/nestjs-exceptions (独立库，无内部依赖)
├── @nestjs/common
├── @nestjs/core
└── rxjs
```

### 3.3 核心组件

#### 3.3.1 异常类层次

```
AbstractHttpException (抽象基类)
├── GeneralBadRequestException (400)
├── GeneralNotFoundException (404)
├── GeneralInternalServerException (500)
├── InvalidIsolationContextException (400)
├── TenantNotFoundException (404)
└── UnauthorizedOrganizationException (403)
```

#### 3.3.2 过滤器链

```
请求 → 业务逻辑
         ↓ 抛出异常
      HttpExceptionFilter (处理 HttpException)
         ↓ 未捕获
      AnyExceptionFilter (处理所有异常)
         ↓
      RFC7807 格式响应
```

## 4. 实施步骤

### Phase 1: 项目初始化（1 小时）

#### T001: 创建项目结构

- 创建 `libs/nestjs-exceptions` 目录
- 创建基础目录结构

#### T002: 配置 package.json

- 设置包名和版本
- 配置依赖
- 配置脚本

#### T003: 配置 tsconfig.json

- 继承 monorepo 根配置
- 配置路径映射

#### T004: 配置 jest.config.ts

- 支持 ES Module
- 配置覆盖率

#### T005: 配置 .swcrc

- 配置编译选项

### Phase 2: 核心异常类迁移（1.5 小时）

#### T006: 迁移 AbstractHttpException

- 复制 `abstract-http.exception.ts`
- 复制 `abstract-http.exception.spec.ts`
- 更新导入路径

#### T007: 迁移标准异常类

- 复制 GeneralBadRequestException
- 复制 GeneralNotFoundException
- 复制 GeneralInternalServerException
- 更新导入路径

#### T008: 迁移业务异常类

- 复制 InvalidIsolationContextException
- 复制 TenantNotFoundException
- 复制 UnauthorizedOrganizationException
- 更新导入路径

#### T009: 创建 core/index.ts

- 导出所有异常类

### Phase 3: 过滤器迁移（1 小时）

#### T010: 迁移 HttpExceptionFilter

- 复制 `http-exception.filter.ts`
- 复制 `http-exception.filter.spec.ts`
- 更新导入路径

#### T011: 迁移 AnyExceptionFilter

- 复制 `any-exception.filter.ts`
- 复制 `any-exception.filter.spec.ts`
- 更新导入路径

#### T012: 创建 filters/index.ts

- 导出所有过滤器

### Phase 4: 消息提供器迁移（0.5 小时）

#### T013: 迁移消息提供器

- 复制 `exception-message.provider.ts`
- 复制 `default-message.provider.ts`
- 复制 `default-message.provider.spec.ts`
- 更新导入路径

#### T014: 创建 providers/index.ts

- 导出所有提供器

### Phase 5: 配置和模块迁移（0.5 小时）

#### T015: 迁移配置

- 复制 `exception.config.ts`
- 创建 `config/index.ts`

#### T016: 迁移 ExceptionModule

- 复制 `exception.module.ts`
- 更新导入路径

#### T017: 创建主导出文件

- 创建 `src/index.ts`
- 导出所有公共 API

### Phase 6: 测试和验证（1.5 小时）

#### T018: 运行单元测试

- 执行 `pnpm test`
- 验证所有测试通过
- 检查覆盖率

#### T019: 执行构建

- 执行 `pnpm build`
- 验证编译无错误
- 检查生成的类型定义

#### T020: 类型检查

- 执行 `pnpm typecheck`
- 修复类型错误

### Phase 7: 文档（1 小时）

#### T021: 编写 README.md

- 模块介绍
- 安装和使用
- API 文档
- 示例代码

#### T022: 编写 CHANGELOG.md

- 初始版本说明

### Phase 8: 集成验证（1.5 小时）

#### T023: 更新 pnpm-workspace.yaml

- 添加新库路径

#### T024: 更新依赖项目

- 更新 `libs/nestjs-infra`
- 更新 `apps/fastify-api`
- 更新导入路径

#### T025: 集成测试

- 在 `apps/fastify-api` 中测试
- 验证异常处理正常

### Phase 9: 清理和提交（1 小时）

#### T026: 删除旧代码

- 删除 `libs/nestjs-infra/src/exceptions`
- 更新 `libs/nestjs-infra/src/index.ts`

#### T027: 全局测试

- 执行全局测试
- 确保无破坏性更改

#### T028: 提交代码

- Git 提交
- 推送到远程

## 5. 测试策略

### 5.1 单元测试

| 测试套件                     | 测试数 | 覆盖目标 |
| ---------------------------- | ------ | -------- |
| AbstractHttpException        | 5      | 95%      |
| GeneralBadRequestException   | 3      | 100%     |
| GeneralNotFoundException     | 3      | 100%     |
| GeneralInternalServerException | 3    | 100%     |
| InvalidIsolationContextException | 3  | 100%     |
| TenantNotFoundException      | 3      | 100%     |
| UnauthorizedOrganizationException | 3 | 100%     |
| HttpExceptionFilter          | 8      | 90%      |
| AnyExceptionFilter           | 6      | 90%      |
| DefaultMessageProvider       | 4      | 95%      |
| ExceptionModule              | 5      | 90%      |

**总计**: ~46 个测试

### 5.2 集成测试

- 在 `apps/fastify-api` 中验证异常处理
- 测试端点错误响应
- 验证 RFC7807 格式

### 5.3 覆盖率目标

- 分支覆盖率: ≥ 90%
- 函数覆盖率: ≥ 90%
- 行覆盖率: ≥ 90%
- 语句覆盖率: ≥ 90%

## 6. 质量保证

### 6.1 代码规范

- ✅ ESLint 检查通过
- ✅ TypeScript 严格模式
- ✅ 完整的 TSDoc 注释（中文）
- ✅ 宪章合规（any 类型 < 1%）

### 6.2 测试规范

- ✅ 单元测试覆盖率 ≥ 90%
- ✅ 所有测试通过
- ✅ 测试用例命名规范

### 6.3 文档规范

- ✅ README.md 完整
- ✅ CHANGELOG.md 完整
- ✅ API 文档完整
- ✅ 示例代码可运行

## 7. 验收标准

### 7.1 功能完整性

- [ ] 所有异常类正常工作
- [ ] 所有过滤器正常工作
- [ ] 消息提供器正常工作
- [ ] 模块配置正确

### 7.2 测试完整性

- [ ] 单元测试覆盖率 ≥ 90%
- [ ] 所有测试通过
- [ ] 集成测试通过

### 7.3 文档完整性

- [ ] README.md 完整
- [ ] CHANGELOG.md 完整
- [ ] TSDoc 注释完整

### 7.4 质量标准

- [ ] 编译无错误
- [ ] ESLint 无警告
- [ ] 类型定义完整

## 8. 风险和缓解

### 8.1 技术风险

| 风险                 | 影响 | 概率 | 缓解措施                     |
| -------------------- | ---- | ---- | ---------------------------- |
| ES Module 兼容问题   | 高   | 中   | 参考已有库的 Jest 配置       |
| 类型定义不完整       | 中   | 低   | 严格类型检查 + 测试          |
| 依赖版本冲突         | 中   | 低   | 使用 monorepo 统一版本       |

### 8.2 业务风险

| 风险                 | 影响 | 概率 | 缓解措施                     |
| -------------------- | ---- | ---- | ---------------------------- |
| 功能遗漏             | 高   | 低   | 完整的功能检查清单           |
| 集成失败             | 高   | 低   | 提前在应用中验证             |
| 性能回归             | 中   | 低   | 保持原有实现逻辑不变         |

## 9. 里程碑

| 里程碑           | 预计完成时间 | 验收标准                     |
| ---------------- | ------------ | ---------------------------- |
| 项目初始化       | 1 小时       | 目录结构和配置完成           |
| 代码迁移         | 3.5 小时     | 所有代码迁移完成             |
| 测试和验证       | 1.5 小时     | 所有测试通过，覆盖率达标     |
| 文档编写         | 1 小时       | README 和 CHANGELOG 完成     |
| 集成验证         | 1.5 小时     | 应用集成验证通过             |
| 清理和提交       | 1 小时       | 代码提交并推送               |

**总工作量**: 6-9 小时（1 个工作日）

## 10. 成功指标

1. ✅ 独立库成功创建
2. ✅ 所有单元测试通过（覆盖率 ≥ 90%）
3. ✅ 应用集成验证通过
4. ✅ 文档完整
5. ✅ 宪章 100% 合规
6. ✅ 编译和类型检查通过

