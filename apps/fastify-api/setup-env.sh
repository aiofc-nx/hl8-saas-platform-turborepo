#!/bin/bash
# ====================================================================
# Fastify API 环境配置脚本
# ====================================================================
# 用途：自动创建 .env 文件
# 使用：bash setup-env.sh

set -e

echo "🔧 设置 Fastify API 环境配置..."
echo ""

# 进入 fastify-api 目录
cd "$(dirname "$0")"

# 检查 .env 文件是否存在
if [ -f ".env" ]; then
  echo "⚠️  .env 文件已存在"
  read -p "是否覆盖？(y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消操作"
    exit 0
  fi
fi

# 创建 .env 文件
cat > .env << 'EOF'
# ====================================================================
# HL8 SAAS Platform - Fastify API 环境配置
# ====================================================================

# --------------------------------------------------------------------
# 应用配置
# --------------------------------------------------------------------
NODE_ENV=development
PORT=3000

# --------------------------------------------------------------------
# 日志配置
# --------------------------------------------------------------------
LOGGING__LEVEL=info
LOGGING__PRETTY_PRINT=true
LOGGING__ENABLED=true
LOGGING__INCLUDE_ISOLATION_CONTEXT=true
LOGGING__TIMESTAMP=true

# --------------------------------------------------------------------
# 数据库配置 (PostgreSQL) - 匹配 docker-compose.yml
# --------------------------------------------------------------------
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

# --------------------------------------------------------------------
# Redis 配置（缓存）- 匹配 docker-compose.yml
# --------------------------------------------------------------------
REDIS__HOST=localhost
REDIS__PORT=6379
REDIS__DB=0

# 缓存配置
CACHE__TTL=3600
CACHE__PREFIX=hl8:cache:

# --------------------------------------------------------------------
# Metrics 配置
# --------------------------------------------------------------------
METRICS__PATH=/metrics
METRICS__INCLUDE_TENANT_METRICS=true
METRICS__ENABLE_DEFAULT_METRICS=true
EOF

echo "✅ .env 文件创建成功！"
echo ""
echo "📋 配置摘要："
echo "  - 数据库: aiofix_platform@localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - 端口: 3000"
echo ""
echo "🚀 现在可以启动应用："
echo "  pnpm dev"
echo ""

