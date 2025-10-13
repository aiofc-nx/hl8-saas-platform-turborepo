-- ====================================================================
-- HL8 SAAS Platform - 数据库初始化脚本
-- ====================================================================
-- 用途：为 @hl8/database 模块创建示例表
-- 数据库：aiofix_platform
-- ====================================================================

-- 删除已存在的表（仅开发环境）
DROP TABLE IF EXISTS users CASCADE;

-- 创建用户表
CREATE TABLE users (
  -- 主键
  id UUID PRIMARY KEY,
  
  -- 多租户隔离字段
  tenant_id UUID NOT NULL,
  organization_id UUID,
  department_id UUID,
  
  -- 用户基本信息
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  
  -- 状态字段
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 审计字段
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- 唯一约束（租户内唯一）
  CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email),
  CONSTRAINT uq_users_tenant_username UNIQUE (tenant_id, username)
);

-- 创建索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_organization_id ON users(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_users_department_id ON users(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 插入测试数据
INSERT INTO users (id, tenant_id, organization_id, username, email, first_name, last_name, is_active)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    'admin',
    'admin@example.com',
    'Admin',
    'User',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    'john_doe',
    'john@example.com',
    'John',
    'Doe',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    'jane_smith',
    'jane@example.com',
    'Jane',
    'Smith',
    true
  );

-- 验证数据
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT tenant_id) as total_tenants
FROM users;

SELECT 
  id,
  username,
  email,
  first_name,
  last_name,
  created_at
FROM users
ORDER BY created_at;

-- 显示表结构
\d users

