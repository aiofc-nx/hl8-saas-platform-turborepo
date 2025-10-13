#!/bin/bash
# ====================================================================
# Fastify API 测试脚本
# ====================================================================
# 用途：测试 @hl8/database 集成是否正常工作

set -e

API_URL="http://localhost:3000"
TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "🧪 测试 Fastify API + @hl8/database 集成"
echo "=========================================="
echo ""

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 5

# 测试 1: 数据库健康检查
echo "📊 测试 1: 数据库健康检查"
echo "GET $API_URL/users/db/health"
echo "---"
curl -s "$API_URL/users/db/health" | jq '.' || echo "❌ 健康检查失败"
echo ""
echo ""

# 测试 2: 查询用户列表
echo "👥 测试 2: 查询用户列表（多租户隔离）"
echo "GET $API_URL/users"
echo "Headers: X-Tenant-Id: $TENANT_ID"
echo "---"
curl -s "$API_URL/users" \
  -H "X-Tenant-Id: $TENANT_ID" | jq '.' || echo "❌ 查询失败"
echo ""
echo ""

# 测试 3: 创建新用户
echo "➕ 测试 3: 创建新用户（事务管理）"
echo "POST $API_URL/users"
echo "---"
curl -s -X POST "$API_URL/users" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{
    "username": "test_user_'$(date +%s)'",
    "email": "test_'$(date +%s)'@example.com",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.' || echo "❌ 创建失败"
echo ""
echo ""

# 测试 4: 数据库性能指标
echo "📈 测试 4: 数据库性能指标"
echo "GET $API_URL/users/db/metrics"
echo "---"
curl -s "$API_URL/users/db/metrics" | jq '.' || echo "❌ 指标查询失败"
echo ""
echo ""

echo "=========================================="
echo "✅ 测试完成！"
echo ""
echo "💡 提示："
echo "  - 所有端点都应返回 JSON 数据"
echo "  - 健康检查应显示 status: healthy"
echo "  - 用户列表应包含至少 3 个用户"
echo "  - 新用户创建应返回完整的用户对象"
echo "  - 性能指标应显示连接池和查询统计"
echo ""

