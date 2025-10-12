# Exceptions 模块拆分 - 任务清单

## Phase 1: 项目初始化（1 小时）

### T001: 创建项目结构
- [ ] 创建 `libs/nestjs-exceptions` 目录
- [ ] 创建 `src` 目录
- [ ] 创建 `src/core` 目录
- [ ] 创建 `src/filters` 目录
- [ ] 创建 `src/providers` 目录
- [ ] 创建 `src/config` 目录

**文件**: 目录结构  
**预计时间**: 5 分钟

### T002: 配置 package.json
- [ ] 创建 `package.json`
- [ ] 设置包名 `@hl8/nestjs-exceptions`
- [ ] 设置版本 `0.1.0`
- [ ] 配置依赖项
- [ ] 配置脚本（build, test, typecheck）
- [ ] 配置导出（exports）

**文件**: `libs/nestjs-exceptions/package.json`  
**预计时间**: 15 分钟

### T003: 配置 tsconfig.json
- [ ] 创建 `tsconfig.json`
- [ ] 继承 monorepo 根配置
- [ ] 配置编译选项
- [ ] 配置路径映射

**文件**: `libs/nestjs-exceptions/tsconfig.json`  
**预计时间**: 10 分钟

### T004: 配置 jest.config.ts
- [ ] 创建 `jest.config.ts`
- [ ] 配置 ES Module 支持
- [ ] 配置覆盖率目标（≥ 90%）
- [ ] 配置测试匹配模式

**文件**: `libs/nestjs-exceptions/jest.config.ts`  
**预计时间**: 15 分钟

### T005: 配置 .swcrc
- [ ] 创建 `.swcrc`
- [ ] 配置编译选项
- [ ] 配置模块系统（ES2022）

**文件**: `libs/nestjs-exceptions/.swcrc`  
**预计时间**: 10 分钟

---

## Phase 2: 核心异常类迁移（1.5 小时）

### T006: 迁移 AbstractHttpException
- [ ] 复制 `abstract-http.exception.ts`
- [ ] 复制 `abstract-http.exception.spec.ts`
- [ ] 更新导入路径（移除 `@hl8/nestjs-infra` 引用）
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/core/abstract-http.exception.ts`
- `libs/nestjs-exceptions/src/core/abstract-http.exception.spec.ts`

**预计时间**: 20 分钟

### T007: 迁移标准异常类
- [ ] 复制 `general-bad-request.exception.ts`
- [ ] 复制 `general-bad-request.exception.spec.ts`
- [ ] 复制 `general-not-found.exception.ts`
- [ ] 复制 `general-not-found.exception.spec.ts`
- [ ] 复制 `general-internal-server.exception.ts`
- [ ] 复制 `general-internal-server.exception.spec.ts`
- [ ] 更新导入路径
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/core/general-*.exception.ts`
- `libs/nestjs-exceptions/src/core/general-*.exception.spec.ts`

**预计时间**: 30 分钟

### T008: 迁移业务异常类
- [ ] 复制 `invalid-isolation-context.exception.ts`
- [ ] 复制 `invalid-isolation-context.exception.spec.ts`
- [ ] 复制 `tenant-not-found.exception.ts`
- [ ] 复制 `tenant-not-found.exception.spec.ts`
- [ ] 复制 `unauthorized-organization.exception.ts`
- [ ] 复制 `unauthorized-organization.exception.spec.ts`
- [ ] 更新导入路径
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/core/invalid-isolation-context.exception.ts`
- `libs/nestjs-exceptions/src/core/tenant-not-found.exception.ts`
- `libs/nestjs-exceptions/src/core/unauthorized-organization.exception.ts`

**预计时间**: 30 分钟

### T009: 创建 core/index.ts
- [ ] 创建 `core/index.ts`
- [ ] 导出 AbstractHttpException
- [ ] 导出所有标准异常类
- [ ] 导出所有业务异常类

**文件**: `libs/nestjs-exceptions/src/core/index.ts`  
**预计时间**: 5 分钟

---

## Phase 3: 过滤器迁移（1 小时）

### T010: 迁移 HttpExceptionFilter
- [ ] 复制 `http-exception.filter.ts`
- [ ] 复制 `http-exception.filter.spec.ts`
- [ ] 更新导入路径
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/filters/http-exception.filter.ts`
- `libs/nestjs-exceptions/src/filters/http-exception.filter.spec.ts`

**预计时间**: 25 分钟

### T011: 迁移 AnyExceptionFilter
- [ ] 复制 `any-exception.filter.ts`
- [ ] 复制 `any-exception.filter.spec.ts`
- [ ] 更新导入路径
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/filters/any-exception.filter.ts`
- `libs/nestjs-exceptions/src/filters/any-exception.filter.spec.ts`

**预计时间**: 25 分钟

### T012: 创建 filters/index.ts
- [ ] 创建 `filters/index.ts`
- [ ] 导出 HttpExceptionFilter
- [ ] 导出 AnyExceptionFilter
- [ ] 导出 ILoggerService 接口

**文件**: `libs/nestjs-exceptions/src/filters/index.ts`  
**预计时间**: 5 分钟

---

## Phase 4: 消息提供器迁移（0.5 小时）

### T013: 迁移消息提供器
- [ ] 复制 `exception-message.provider.ts`
- [ ] 复制 `default-message.provider.ts`
- [ ] 复制 `default-message.provider.spec.ts`
- [ ] 更新导入路径
- [ ] 验证测试通过

**文件**: 
- `libs/nestjs-exceptions/src/providers/exception-message.provider.ts`
- `libs/nestjs-exceptions/src/providers/default-message.provider.ts`
- `libs/nestjs-exceptions/src/providers/default-message.provider.spec.ts`

**预计时间**: 20 分钟

### T014: 创建 providers/index.ts
- [ ] 创建 `providers/index.ts`
- [ ] 导出 ExceptionMessageProvider
- [ ] 导出 DefaultMessageProvider

**文件**: `libs/nestjs-exceptions/src/providers/index.ts`  
**预计时间**: 5 分钟

---

## Phase 5: 配置和模块迁移（0.5 小时）

### T015: 迁移配置
- [ ] 复制 `exception.config.ts`
- [ ] 创建 `config/index.ts`
- [ ] 导出所有配置类型和常量

**文件**: 
- `libs/nestjs-exceptions/src/config/exception.config.ts`
- `libs/nestjs-exceptions/src/config/index.ts`

**预计时间**: 15 分钟

### T016: 迁移 ExceptionModule
- [ ] 复制 `exception.module.ts`
- [ ] 更新导入路径
- [ ] 验证模块配置正确

**文件**: `libs/nestjs-exceptions/src/exception.module.ts`  
**预计时间**: 10 分钟

### T017: 创建主导出文件
- [ ] 创建 `src/index.ts`
- [ ] 导出核心异常类
- [ ] 导出过滤器
- [ ] 导出消息提供器
- [ ] 导出配置
- [ ] 导出 ExceptionModule

**文件**: `libs/nestjs-exceptions/src/index.ts`  
**预计时间**: 10 分钟

---

## Phase 6: 测试和验证（1.5 小时）

### T018: 运行单元测试
- [ ] 执行 `pnpm install` 安装依赖
- [ ] 执行 `pnpm test` 运行测试
- [ ] 验证所有测试通过
- [ ] 检查覆盖率报告（≥ 90%）
- [ ] 修复失败的测试

**命令**: `cd libs/nestjs-exceptions && pnpm install && pnpm test`  
**预计时间**: 40 分钟

### T019: 执行构建
- [ ] 执行 `pnpm build`
- [ ] 验证编译无错误
- [ ] 检查生成的 `dist/` 目录
- [ ] 验证类型定义文件（.d.ts）

**命令**: `cd libs/nestjs-exceptions && pnpm build`  
**预计时间**: 20 分钟

### T020: 类型检查
- [ ] 执行 `pnpm typecheck`
- [ ] 修复类型错误
- [ ] 验证无类型警告

**命令**: `cd libs/nestjs-exceptions && pnpm typecheck`  
**预计时间**: 20 分钟

---

## Phase 7: 文档（1 小时）

### T021: 编写 README.md
- [ ] 创建 README.md
- [ ] 添加模块介绍
- [ ] 添加安装说明
- [ ] 添加使用示例（forRoot 和 forRootAsync）
- [ ] 添加异常使用示例
- [ ] 添加 API 文档
- [ ] 添加配置选项说明

**文件**: `libs/nestjs-exceptions/README.md`  
**预计时间**: 45 分钟

### T022: 编写 CHANGELOG.md
- [ ] 创建 CHANGELOG.md
- [ ] 添加 v0.1.0 版本说明
- [ ] 列出初始功能

**文件**: `libs/nestjs-exceptions/CHANGELOG.md`  
**预计时间**: 15 分钟

---

## Phase 8: 集成验证（1.5 小时）

### T023: 更新 pnpm-workspace.yaml
- [ ] 打开 `pnpm-workspace.yaml`
- [ ] 添加 `libs/nestjs-exceptions` 到 packages 列表
- [ ] 执行 `pnpm install` 刷新工作区

**文件**: `pnpm-workspace.yaml`  
**预计时间**: 10 分钟

### T024: 更新依赖项目
- [ ] 更新 `libs/nestjs-infra/package.json`，添加 `@hl8/nestjs-exceptions` 依赖
- [ ] 更新 `apps/fastify-api/package.json`，添加 `@hl8/nestjs-exceptions` 依赖
- [ ] 更新导入路径（从 `@hl8/nestjs-infra` 到 `@hl8/nestjs-exceptions`）
- [ ] 执行 `pnpm install`

**文件**: 
- `libs/nestjs-infra/package.json`
- `apps/fastify-api/package.json`
- 相关源代码文件

**预计时间**: 30 分钟

### T025: 集成测试
- [ ] 在 `apps/fastify-api` 中启动应用
- [ ] 测试正常端点（GET /）
- [ ] 测试异常端点（触发 404, 500 等）
- [ ] 验证异常响应格式（RFC7807）
- [ ] 验证日志输出

**命令**: `cd apps/fastify-api && pnpm start`  
**预计时间**: 40 分钟

---

## Phase 9: 清理和提交（1 小时）

### T026: 删除旧代码
- [ ] 删除 `libs/nestjs-infra/src/exceptions` 目录
- [ ] 更新 `libs/nestjs-infra/src/index.ts`（移除 exceptions 导出）
- [ ] 验证 `libs/nestjs-infra` 编译无错误

**文件**: 
- `libs/nestjs-infra/src/exceptions/`（删除）
- `libs/nestjs-infra/src/index.ts`

**预计时间**: 15 分钟

### T027: 全局测试
- [ ] 在 monorepo 根目录执行 `pnpm test`
- [ ] 验证所有项目测试通过
- [ ] 修复破坏性更改

**命令**: `pnpm test`  
**预计时间**: 30 分钟

### T028: 提交代码
- [ ] 执行 `git add .`
- [ ] 提交：`feat(nestjs-exceptions): 拆分 Exceptions 模块为独立库`
- [ ] 推送到远程：`git push origin 003-exceptions-split`

**命令**: 
```bash
git add .
git commit -m "feat(nestjs-exceptions): 拆分 Exceptions 模块为独立库

- 创建 @hl8/nestjs-exceptions 独立库
- 迁移核心异常类（7 个）
- 迁移异常过滤器（2 个）
- 迁移消息提供器（1 个）
- 完整的单元测试（覆盖率 ≥ 90%）
- 完整的 TSDoc 注释
- README 和 CHANGELOG
- 应用集成验证通过"
git push origin 003-exceptions-split
```

**预计时间**: 15 分钟

---

## 总结

| Phase | 任务数 | 预计时间 |
| ----- | ------ | -------- |
| Phase 1: 项目初始化 | 5 | 1 小时 |
| Phase 2: 核心异常类迁移 | 4 | 1.5 小时 |
| Phase 3: 过滤器迁移 | 3 | 1 小时 |
| Phase 4: 消息提供器迁移 | 2 | 0.5 小时 |
| Phase 5: 配置和模块迁移 | 3 | 0.5 小时 |
| Phase 6: 测试和验证 | 3 | 1.5 小时 |
| Phase 7: 文档 | 2 | 1 小时 |
| Phase 8: 集成验证 | 3 | 1.5 小时 |
| Phase 9: 清理和提交 | 3 | 1 小时 |
| **总计** | **28** | **9 小时** |

---

## 验收标准

### 功能完整性
- [ ] 所有异常类正常工作
- [ ] 所有过滤器正常工作
- [ ] 消息提供器正常工作
- [ ] 模块配置正确

### 测试完整性
- [ ] 单元测试覆盖率 ≥ 90%
- [ ] 所有测试通过
- [ ] 集成测试通过

### 文档完整性
- [ ] README.md 完整
- [ ] CHANGELOG.md 完整
- [ ] TSDoc 注释完整

### 质量标准
- [ ] 编译无错误
- [ ] ESLint 无警告
- [ ] 类型定义完整
- [ ] 宪章 100% 合规

