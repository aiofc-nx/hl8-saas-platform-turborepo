# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

**GATE**: Must pass before Phase 0 research. Re-check after Phase 1 design.

### 中文优先原则 (NON-NEGOTIABLE)

- [ ] 所有代码注释使用中文，遵循 TSDoc 规范
- [ ] 技术文档使用中文编写
- [ ] 错误消息和日志使用中文
- [ ] API 文档和接口说明使用中文

### 代码即文档原则

- [ ] 所有公共 API、类、方法、接口、枚举添加完整 TSDoc 注释
- [ ] 注释包含业务规则、业务逻辑、异常处理和使用示例
- [ ] 注释包含 @description、@param、@returns、@throws、@example 标记

### 架构原则

- [ ] 遵循 Clean Architecture + CQRS + ES + EDA 架构模式
- [ ] 领域实体和聚合根分离
- [ ] 用例在文档和设计中明确提及
- [ ] 命令和查询分离
- [ ] 事件溯源和事件驱动设计

### Monorepo 组织原则

- [ ] 项目结构符合 apps/packages/examples 组织
- [ ] 领域模块作为独立项目开发
- [ ] 使用 pnpm 作为包管理工具
- [ ] 服务模块命名去掉 "-service" 后缀

### 质量保证原则

- [ ] ESLint 配置继承根目录配置
- [ ] TypeScript 配置继承 monorepo 根 tsconfig.json
- [ ] 使用 MCP 工具进行代码检查

### 测试架构原则

- [ ] 单元测试文件与被测试文件在同一目录（.spec.ts）
- [ ] 集成测试放置在 `__tests__/integration/` 目录
- [ ] 端到端测试放置在 `__tests__/e2e/` 目录
- [ ] 测试之间相互独立，不依赖执行顺序
- [ ] 核心业务逻辑测试覆盖率 ≥ 80%
- [ ] 所有公共 API 必须有对应的测试用例

### 数据隔离与共享原则

- [ ] 所有业务数据支持多层级隔离（平台、租户、组织、部门、用户）
- [ ] 数据模型包含必需的隔离字段（tenantId、organizationId、departmentId、userId）
- [ ] 为隔离字段创建数据库索引以优化查询性能
- [ ] 数据明确分类为共享数据或非共享数据
- [ ] 共享数据定义了明确的共享级别（平台/租户/组织/部门）
- [ ] API请求携带完整的隔离标识（X-Tenant-Id、X-Organization-Id、X-Department-Id、X-User-Id）
- [ ] 系统自动根据隔离上下文过滤数据，无需手动处理
- [ ] 缓存键包含完整的隔离层级信息
- [ ] 所有数据访问记录完整的隔离上下文到日志
- [ ] 跨层级数据访问触发审计事件

### 统一语言原则（Ubiquitous Language）

- [ ] 所有文档和代码使用 `docs/definition-of-terms.mdc` 中定义的统一术语
- [ ] 核心业务实体命名符合术语定义（Platform、Tenant、Organization、Department、User）
- [ ] 接口和方法命名使用统一术语，确保业务语义清晰
- [ ] 代码注释中使用统一术语描述业务逻辑
- [ ] 技术实现能够追溯到业务术语和领域模型

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Document the selected structure and reference the real
directories captured above

## Complexity Tracking

**Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
