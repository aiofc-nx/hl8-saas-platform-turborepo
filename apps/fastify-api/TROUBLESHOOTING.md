# 故障排查指南

## 问题 1: 配置验证失败 - 数据库字段为 undefined

### 错误信息

```
ConfigError: Configuration validation failed with 1 errors
  database: undefined
  username: undefined
  password: undefined
```

### 原因

`.env` 文件缺少必需的数据库配置字段。

### 解决方案

确保 `.env` 文件包含以下配置：

```env
# 数据库配置（必需）
DATABASE__TYPE=postgresql
DATABASE__HOST=localhost
DATABASE__PORT=5432
DATABASE__DATABASE=aiofix_platform
DATABASE__USERNAME=aiofix_user
DATABASE__PASSWORD=aiofix_password
DATABASE__DEBUG=true

# 连接池配置（可选）
DATABASE__POOL_MIN=5
DATABASE__POOL_MAX=20
DATABASE__IDLE_TIMEOUT_MILLIS=600000
DATABASE__ACQUIRE_TIMEOUT_MILLIS=10000
```

### 验证

启动应用后应该看到：

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] DatabaseModule dependencies initialized
[Nest] INFO Application is running on: http://localhost:3001
```

---

## 问题 2: 端口被占用

### 错误信息

```
Error: listen EADDRINUSE: address already in use :::3000
```

### 解决方案

修改 `.env` 文件中的端口：

```env
PORT=3001  # 或其他可用端口
```

---

## 问题 3: 数据库连接失败

### 错误信息

```
DatabaseConnectionException: 无法连接到数据库服务器
```

### 检查清单

1. **Docker 容器是否运行**:

   ```bash
   docker ps | grep aiofix-postgres
   ```

2. **端口是否可访问**:

   ```bash
   nc -zv localhost 5432
   # 或
   telnet localhost 5432
   ```

3. **数据库配置是否正确**:

   ```bash
   docker exec aiofix-postgres pg_isready -U aiofix_user
   ```

4. **测试数据库连接**:

   ```bash
   docker exec -it aiofix-postgres psql -U aiofix_user -d aiofix_platform -c "SELECT version();"
   ```

---

## 问题 4: 表不存在

### 错误信息

```
relation "users" does not exist
```

### 解决方案

运行数据库初始化脚本：

```bash
cd /home/arligle/hl8/hl8-saas-platform-turborepo
docker exec -i aiofix-postgres psql -U aiofix_user -d aiofix_platform < apps/fastify-api/init-db.sql
```

### 验证

```bash
docker exec -it aiofix-postgres psql -U aiofix_user -d aiofix_platform -c "\dt"
```

应该看到 `users` 表。

---

## 问题 5: WSL2 网络问题

### 症状

- Docker 容器在 Windows，WSL2 无法连接

### 解决方案

1. **使用 localhost**:

   ```env
   DATABASE__HOST=localhost
   REDIS__HOST=localhost
   ```

2. **或使用 Windows IP**:

   ```bash
   # 获取 Windows IP
   ip route | grep default | awk '{print $3}'
   
   # 更新 .env
   DATABASE__HOST=172.x.x.x  # Windows IP
   ```

3. **验证端口转发**:

   ```bash
   netstat -tuln | grep 5432
   ```

---

## 快速诊断脚本

```bash
#!/bin/bash
echo "🔍 诊断 fastify-api 环境..."
echo ""

# 检查 .env 文件
echo "1. 检查 .env 文件"
if [ -f ".env" ]; then
  echo "✅ .env 文件存在"
  echo "   数据库配置:"
  grep DATABASE .env | head -5
else
  echo "❌ .env 文件不存在"
fi
echo ""

# 检查 Docker 容器
echo "2. 检查 Docker 容器"
if docker ps | grep -q aiofix-postgres; then
  echo "✅ PostgreSQL 容器运行中"
else
  echo "❌ PostgreSQL 容器未运行"
fi
echo ""

# 检查端口
echo "3. 检查端口"
if nc -zv localhost 5432 2>&1 | grep -q succeeded; then
  echo "✅ 端口 5432 可访问"
else
  echo "❌ 端口 5432 不可访问"
fi
echo ""

# 检查数据库表
echo "4. 检查数据库表"
if docker exec aiofix-postgres psql -U aiofix_user -d aiofix_platform -c "\dt" 2>&1 | grep -q users; then
  echo "✅ users 表存在"
else
  echo "❌ users 表不存在，运行: docker exec -i aiofix-postgres psql -U aiofix_user -d aiofix_platform < init-db.sql"
fi
echo ""

echo "诊断完成！"
```

保存为 `diagnose.sh` 并运行：

```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## 常用命令

### 启动应用

```bash
# 方式 1: 前台运行（推荐）
pnpm --filter fastify-api dev

# 方式 2: 使用 VSCode 任务
# Tasks > Run Task > start:dev
```

### 查看日志

```bash
# 应用日志（如果后台运行）
tail -f logs/app.log

# Docker 日志
docker logs -f aiofix-postgres
```

### 数据库操作

```bash
# 连接数据库
docker exec -it aiofix-postgres psql -U aiofix_user -d aiofix_platform

# 查看表
\dt

# 查看表结构
\d users

# 查询数据
SELECT * FROM users;

# 退出
\q
```

### 测试 API

```bash
# 健康检查
curl http://localhost:3001/users/db/health

# 查询用户（需要 Tenant ID）
curl http://localhost:3001/users \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"

# 性能指标
curl http://localhost:3001/users/db/metrics
```

---

## 获取帮助

如果问题仍未解决：

1. 查看 [QUICKSTART.md](./QUICKSTART.md)
2. 查看 [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md)
3. 查看 [README_DATABASE.md](./README_DATABASE.md)
4. 检查应用日志输出
5. 检查 Docker 容器状态

---

最后更新: 2025-10-13
