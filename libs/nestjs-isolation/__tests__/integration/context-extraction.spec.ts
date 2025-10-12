/**
 * 隔离上下文提取集成测试
 * 
 * @description 测试从 HTTP 请求头自动提取隔离上下文的功能
 * 
 * ## 测试场景
 * 
 * - ✅ 提取平台级上下文（无标识符）
 * - ✅ 提取租户级上下文
 * - ✅ 提取组织级上下文
 * - ✅ 提取部门级上下文
 * - ✅ 提取用户级上下文（无租户）
 * - ✅ 提取用户级上下文（有租户）
 * - ✅ 缺少必需标识符时降级
 * - ✅ 无效 UUID 时降级到平台级
 * 
 * @group integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { IsolationModule } from '../../src/isolation.module.js';
import { IsolationContextService } from '../../src/services/isolation-context.service.js';
import { CurrentContext } from '../../src/decorators/current-context.decorator.js';
import { IsolationContext, IsolationLevel } from '@hl8/isolation-model';
import request from 'supertest';

// 测试用的有效 UUID v4
const UUID_TENANT = '550e8400-e29b-41d4-a716-446655440000';
const UUID_ORG = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
const UUID_DEPT = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const UUID_USER = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/**
 * 测试控制器
 * 
 * @description 用于测试上下文提取的简单控制器
 */
@Controller('test')
class TestController {
  constructor(private readonly contextService: IsolationContextService) {}
  
  @Get('context')
  getContext() {
    const context = this.contextService.getIsolationContext();
    
    if (!context) {
      return { error: 'No context found' };
    }
    
    return {
      level: context.getIsolationLevel(),
      tenantId: context.tenantId?.getValue(),
      organizationId: context.organizationId?.getValue(),
      departmentId: context.departmentId?.getValue(),
      userId: context.userId?.getValue(),
      isEmpty: context.isEmpty(),
    };
  }
}

describe('IsolationModule - Context Extraction Integration', () => {
  let app: INestApplication;
  let contextService: IsolationContextService;
  
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IsolationModule.forRoot()],
      controllers: [TestController],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    contextService = moduleFixture.get<IsolationContextService>(IsolationContextService);
  });
  
  afterEach(async () => {
    await app.close();
  });
  
  describe('平台级上下文', () => {
    it('应该在没有任何标识符时创建平台级上下文', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.PLATFORM,
        tenantId: undefined,
        organizationId: undefined,
        departmentId: undefined,
        userId: undefined,
        isEmpty: true,
      });
    });
  });
  
  describe('租户级上下文', () => {
    it('应该从 X-Tenant-Id 请求头提取租户级上下文', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.TENANT,
        tenantId: UUID_TENANT,
        organizationId: undefined,
        departmentId: undefined,
        userId: undefined,
        isEmpty: false,
      });
    });
  });
  
  describe('组织级上下文', () => {
    it('应该从请求头提取组织级上下文', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-Organization-Id', UUID_ORG)
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.ORGANIZATION,
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
        departmentId: undefined,
        userId: undefined,
        isEmpty: false,
      });
    });
    
    it('应该在缺少租户 ID 时降级处理', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Organization-Id', UUID_ORG) // 缺少租户 ID
        .expect(200);
      
      // 应该降级到平台级
      expect(response.body.level).toBe(IsolationLevel.PLATFORM);
      expect(response.body.isEmpty).toBe(true);
    });
  });
  
  describe('部门级上下文', () => {
    it('应该从请求头提取部门级上下文', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-Organization-Id', UUID_ORG)
        .set('X-Department-Id', UUID_DEPT)
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.DEPARTMENT,
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
        departmentId: UUID_DEPT,
        userId: undefined,
        isEmpty: false,
      });
    });
    
    it('应该在缺少组织 ID 时降级处理', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-Department-Id', UUID_DEPT) // 缺少组织 ID
        .expect(200);
      
      // 应该降级到租户级
      expect(response.body.level).toBe(IsolationLevel.TENANT);
      expect(response.body.tenantId).toBe(UUID_TENANT);
    });
  });
  
  describe('用户级上下文', () => {
    it('应该从 X-User-Id 提取用户级上下文（无租户）', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-User-Id', UUID_USER)
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.USER,
        tenantId: undefined,
        organizationId: undefined,
        departmentId: undefined,
        userId: UUID_USER,
        isEmpty: false,
      });
    });
    
    it('应该提取用户级上下文（有租户）', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-User-Id', UUID_USER)
        .set('X-Tenant-Id', UUID_TENANT)
        .expect(200);
      
      expect(response.body).toEqual({
        level: IsolationLevel.USER,
        tenantId: UUID_TENANT,
        organizationId: undefined,
        departmentId: undefined,
        userId: UUID_USER,
        isEmpty: false,
      });
    });
  });
  
  describe('错误处理', () => {
    it('应该在 UUID 格式无效时降级到平台级', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', 'invalid-uuid') // 无效 UUID
        .expect(200);
      
      // 应该降级到平台级
      expect(response.body.level).toBe(IsolationLevel.PLATFORM);
      expect(response.body.isEmpty).toBe(true);
    });
    
    it('应该处理多个无效标识符', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', 'invalid')
        .set('X-Organization-Id', 'also-invalid')
        .expect(200);
      
      // 应该降级到平台级
      expect(response.body.level).toBe(IsolationLevel.PLATFORM);
    });
  });
  
  describe('请求头大小写', () => {
    it('应该正确处理小写请求头', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('x-tenant-id', UUID_TENANT) // 小写
        .expect(200);
      
      expect(response.body.level).toBe(IsolationLevel.TENANT);
      expect(response.body.tenantId).toBe(UUID_TENANT);
    });
  });
  
  describe('层级优先级', () => {
    it('部门级应该优先于组织级', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-Organization-Id', UUID_ORG)
        .set('X-Department-Id', UUID_DEPT)
        .expect(200);
      
      expect(response.body.level).toBe(IsolationLevel.DEPARTMENT);
    });
    
    it('组织级应该优先于租户级', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-Organization-Id', UUID_ORG)
        .expect(200);
      
      expect(response.body.level).toBe(IsolationLevel.ORGANIZATION);
    });
    
    it('租户级应该优先于用户级（当两者都存在时）', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/context')
        .set('X-Tenant-Id', UUID_TENANT)
        .set('X-User-Id', UUID_USER)
        .expect(200);
      
      // 当有租户ID和用户ID时，应该创建带租户的用户级上下文
      expect(response.body.level).toBe(IsolationLevel.USER);
      expect(response.body.tenantId).toBe(UUID_TENANT);
      expect(response.body.userId).toBe(UUID_USER);
    });
  });
});

