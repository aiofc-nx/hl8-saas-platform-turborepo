# 🚀 Turborepo 快速参考

## 📊 依赖关系一图看懂

```
                    ┌─────────────────────┐
                    │  libs/nestjs-infra  │
                    │   (基础设施层)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │   必须先构建(^build)  │
                    └──────────┬──────────┘
                               │
        ┏━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━┓
        ┃                                               ┃
  ┌─────┴──────┐                                 ┌─────┴──────┐
  │ apps/      │                                 │ apps/api   │
  │ fastify-api│                                 │            │
  └────────────┘                                 └────────────┘
```

---

## ⚡ 常用命令速查

| 场景 | 命令 | 说明 |
|------|------|------|
| **开发** | `cd apps/fastify-api && pnpm dev` | 直接启动，无需构建 libs |
| **构建全部** | `pnpm turbo build` | 按依赖顺序构建所有项目 |
| **构建单个** | `pnpm turbo build --filter=fastify-api...` | 构建指定应用及其依赖 |
| **类型检查** | `pnpm turbo type-check` | 检查所有项目类型 |
| **代码检查** | `pnpm turbo lint` | 运行 ESLint |
| **运行测试** | `pnpm turbo test` | 运行单元测试 |
| **清理** | `pnpm turbo clean` | 清理所有构建产物 |

---

## 🎯 工作流程

### 开发流程（最常用）⭐

```bash
# 1️⃣ 安装依赖（首次）
pnpm install

# 2️⃣ 启动开发服务器（无需构建！）
cd apps/fastify-api
pnpm dev

# 3️⃣ 开发
# ✅ 修改 apps/fastify-api 代码 → 自动重载
# ✅ 修改 libs/nestjs-infra 代码 → 自动重载
# ✅ 完整的类型提示和调试支持
```

### 提交代码前

```bash
# 运行所有检查
pnpm turbo type-check lint test

# 或者单独运行
pnpm turbo type-check  # 类型检查
pnpm turbo lint        # 代码规范
pnpm turbo test        # 单元测试
```

### 生产部署

```bash
# 1️⃣ 安装依赖
pnpm install --frozen-lockfile

# 2️⃣ 构建（自动按依赖顺序）
pnpm turbo build

# 3️⃣ 启动生产服务
cd apps/fastify-api
pnpm start
```

---

## 🔍 依赖符号说明

| 符号 | 含义 | 示例 |
|------|------|------|
| `^build` | 先构建**所有依赖项** | libs → apps |
| `build` | 先构建**当前项目** | 自身的其他任务 |
| `[]` | **无依赖** | dev 模式（直接启动）|

### 实际案例

```json
// apps/fastify-api 执行 build 任务
{
  "build": {
    "dependsOn": ["^build"]  // ← 先构建 libs/nestjs-infra
  }
}

// 执行顺序：
// 1. libs/nestjs-infra build  ✅
// 2. apps/fastify-api build   ✅
```

---

## 💡 最佳实践

### ✅ DO（推荐）

```bash
# ✅ 开发时直接启动（无需构建）
pnpm dev

# ✅ 使用 Turborepo 管理构建顺序
pnpm turbo build

# ✅ 使用过滤器构建特定项目
pnpm turbo build --filter=fastify-api...

# ✅ 提交前运行完整检查
pnpm turbo type-check lint test
```

### ❌ DON'T（避免）

```bash
# ❌ 不要手动构建依赖项
cd libs/nestjs-infra && pnpm build
cd apps/fastify-api && pnpm build

# ❌ 不要在开发模式构建
cd libs/nestjs-infra && pnpm build  # 不需要！
cd apps/fastify-api && pnpm dev

# ❌ 不要跳过类型检查
pnpm build --no-type-check
```

---

## 📈 性能对比

| 操作 | 传统方式 | Turborepo + 路径别名 | 提升 |
|------|---------|---------------------|------|
| **dev 启动** | ~30s | ~3s | **10x** ⚡ |
| **修改 libs** | 重新构建 ~20s | 热重载 <1s | **20x** 🔥 |
| **CI 构建** | 顺序构建 ~5min | 并行 + 缓存 ~2min | **2.5x** 🚀 |

---

## 🐛 常见问题

### Q1: 开发时需要构建 libs 吗？

**A**: ❌ **不需要！**使用路径别名直接访问源码。

### Q2: 类型检查报错找不到模块？

**A**: 运行 `pnpm turbo build` 生成类型声明文件。

### Q3: 测试失败找不到模块？

**A**: 确保运行了 `pnpm turbo build`，测试依赖编译产物。

### Q4: 如何只构建一个应用？

**A**: 使用过滤器：`pnpm turbo build --filter=fastify-api...`

### Q5: 如何清理重建？

**A**: `pnpm turbo clean && pnpm turbo build`

---

## 🎓 进阶技巧

### 并行开发多个应用

```bash
# Terminal 1
cd apps/fastify-api && pnpm dev

# Terminal 2  
cd apps/web && pnpm dev

# libs 的修改会同时热重载到两个应用！
```

### 增量构建（只构建变更部分）

```bash
# 只构建自上次 git commit 以来变更的项目
pnpm turbo build --filter=[HEAD^1]
```

### 远程缓存（团队共享）

```bash
# 配置远程缓存
pnpm turbo login
pnpm turbo link

# 其他团队成员可以复用构建缓存！
pnpm turbo build  # 可能直接命中远程缓存
```

### 查看任务依赖图

```bash
# 生成依赖图（需要安装 graphviz）
pnpm turbo run build --graph
```

---

## 📚 延伸阅读

- [完整构建顺序说明](./docs/turborepo-build-order.md)
- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [Monorepo 最佳实践](./docs/monorepo-best-practices.md)

---

## 🎯 记住这些核心点

1. **开发模式**：直接 `pnpm dev`，无需构建 ⚡
2. **生产构建**：`pnpm turbo build` 自动管理依赖顺序 🚀
3. **提交前**：`pnpm turbo type-check lint test` ✅
4. **问题排查**：清理重建 `pnpm turbo clean && pnpm install` 🔧

---

**享受 10x 的开发体验吧！** 🎉
