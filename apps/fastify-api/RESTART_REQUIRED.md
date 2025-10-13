# 🔄 需要重启应用

## 原因

`@hl8/config` 库已更新并重新构建，添加了 `enableImplicitConversion: true`。

由于 NestJS 的文件监视不会自动重新加载依赖库的更改，您需要手动重启应用。

## 如何重启

### 方式 1: VSCode 任务（推荐）

1. 在终端按 `Ctrl+C` 停止当前任务
2. 重新运行任务: `pnpm run dev`

### 方式 2: 命令行

```bash
# 停止当前进程 (Ctrl+C)
# 然后重新启动
cd /home/arligle/hl8/hl8-saas-platform-turborepo
pnpm --filter fastify-api dev
```

## 预期结果

重启后应该看到：

```
Successfully compiled: 12 files with swc
[dotenv] injecting env (26) from .env
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] TypedConfigModule dependencies initialized ✅
[Nest] INFO [InstanceLoader] DatabaseModule dependencies initialized ✅
[Nest] INFO ConnectionManager 初始化
[Nest] INFO 数据库连接成功 ✅
[Nest] INFO Application is running on: http://localhost:3001 ✅
```

## 如果仍然失败

如果重启后仍然出现配置验证错误，请运行：

```bash
# 清理并重新构建所有依赖
cd /home/arligle/hl8/hl8-saas-platform-turborepo
pnpm --filter @hl8/config build
pnpm --filter @hl8/database build  
pnpm --filter fastify-api build

# 然后重新启动
pnpm --filter fastify-api dev
```

---

**@hl8/database 模块已完全就绪，只需重启应用即可！** 🚀
