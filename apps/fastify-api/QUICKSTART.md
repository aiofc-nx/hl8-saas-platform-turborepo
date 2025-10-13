# Fastify API 快速启动指南

## 前提条件

✅ Docker 已启动（docker-compose.yml）  
✅ PostgreSQL 数据库已就绪（aiofix_platform）  
✅ Redis 已就绪  
✅ 数据库表已创建（users 表）

---

## 1. 创建环境配置文件

在 `apps/fastify-api/` 目录下创建 `.env` 文件：

```bash
cd apps/fastify-api
cp .env.example .env  # 或手动创建
```

`.env` 文件内容（匹配 docker-compose.yml 配置）：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 日志配置
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=true
LOGGING__ENABLED=true
LOGGING__INCLUDE_ISOLATION_CONTEXT=true
LOGGING__TIMESTAMP=true

# 数据库配置（匹配 docker-compose.yml）
DATABASE__TYPE=postgresql
DATABASE__HOST=localhost
DATABASE__PORT=5432
DATABASE__DATABASE=aiofix_platform
DATABASE__USERNAME=aiofix_user
DATABASE__PASSWORD=aiofix_password
DATABASE__DEBUG=true

# 连接池配置
DATABASE__POOL_MIN=5
DATABASE__POOL_MAX=20
DATABASE__IDLE_TIMEOUT_MILLIS=30000
DATABASE__ACQUIRE_TIMEOUT_MILLIS=30000

# Redis 配置（匹配 docker-compose.yml）
REDIS__HOST=localhost
REDIS__PORT=6379
REDIS__DB=0
CACHE__TTL=3600
CACHE__PREFIX=hl8:cache:

# Metrics 配置
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
METRICS__ENABLE_DEFAULT_METRICS=true
```

---

## 2. 验证数据库

验证数据库表和测试数据：

```bash
# 通过 Docker 连接数据库
docker exec -it aiofix-postgres psql -U aiofix_user -d aiofix_platform

# 在 psql 中执行
SELECT COUNT(*) FROM users;
SELECT username, email FROM users;
\q
```

预期结果：应该看到 3 条测试用户数据。

---

## 3. 启动应用

### 开发模式（推荐）

```bash
# 在项目根目录
cd /home/arligle/hl8/hl8-saas-platform-turborepo

# 启动 fastify-api
pnpm --filter fastify-api dev
```

或者：

```bash
# 直接在 fastify-api 目录
cd apps/fastify-api
pnpm dev
```

### 生产模式

```bash
# 构建
pnpm --filter fastify-api build

# 启动
pnpm --filter fastify-api start
```

---

## 4. 测试 API

应用启动后（默认端口 3000），测试以下端点：

### 4.1 数据库健康检查

```bash
curl http://localhost:3000/users/db/health
```

预期响应：

```json
{
  "status": "healthy",
  "connection": {
    "isConnected": true,
    "connectedAt": "2025-10-13T06:00:00.000Z"
  },
  "pool": {
    "total": 10,
    "active": 2,
    "idle": 8,
    "waiting": 0,
    "max": 20,
    "min": 5
  },
  "responseTime": 5
}
```

### 4.2 查询用户列表

```bash
curl http://localhost:3000/users \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"
```

预期响应：应该返回 3 个测试用户。

### 4.3 创建新用户

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 4.4 查看数据库指标

```bash
curl http://localhost:3000/users/db/metrics
```

预期响应：

```json
{
  "timestamp": "2025-10-13T06:00:00.000Z",
  "pool": {
    "total": 10,
    "active": 2,
    "idle": 8,
    "waiting": 0,
    "max": 20,
    "min": 5
  },
  "queries": {
    "total": 15,
    "slowCount": 0,
    "avgDuration": 12.5
  },
  "transactions": {
    "committed": 5,
    "rolledBack": 0,
    "active": 0
  },
  "slowQueries": []
}
```

---

## 5. 访问管理界面

Docker Compose 已经启动了以下管理界面：

### pgAdmin（PostgreSQL 管理）

- URL: <http://localhost:8080>
- Email: <admin@aiofix.com>
- Password: admin123

连接数据库配置：

- Host: postgres（或 localhost）
- Port: 5432
- Database: aiofix_platform
- Username: aiofix_user
- Password: aiofix_password

### Redis Commander（Redis 管理）

- URL: <http://localhost:8081>

---

## 6. 常见问题

### 问题 1: 应用启动失败，提示数据库连接错误

**解决方案**：

1. 检查 Docker 容器是否运行：

   ```bash
   docker ps | grep aiofix-postgres
   ```

2. 检查数据库连接：

   ```bash
   docker exec aiofix-postgres pg_isready -U aiofix_user
   ```

3. 检查 .env 文件配置是否正确

### 问题 2: 端口被占用

**解决方案**：

修改 .env 文件中的 PORT：

```env
PORT=3001  # 或其他可用端口
```

### 问题 3: 查询用户返回空列表

**解决方案**：

1. 确认使用了正确的 Tenant ID：

   ```
   X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000
   ```

2. 检查数据库中的数据：

   ```bash
   docker exec -it aiofix-postgres psql -U aiofix_user -d aiofix_platform -c "SELECT * FROM users;"
   ```

---

## 7. 下一步

- ✅ 阅读 [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) 了解更多集成细节
- ✅ 查看 [User Entity](./src/entities/user.entity.ts) 的实现
- ✅ 查看 [User Service](./src/services/user.service.ts) 的事务和隔离示例
- ✅ 添加更多业务实体和服务

---

## 8. 开发工具

### 热重载

应用使用 SWC 编译，支持热重载：

```bash
pnpm dev  # 文件修改后自动重启
```

### 类型检查

```bash
pnpm type-check
```

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

---

## 总结

现在您已经成功集成了 @hl8/database 模块！

核心功能：

- ✅ 数据库连接管理
- ✅ 多租户数据隔离
- ✅ 声明式事务管理
- ✅ 健康检查和性能监控
- ✅ REST API 示例

享受开发！🚀
