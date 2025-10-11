/**
 * IsolationContext 单元测试
 */

import { IsolationContext } from './isolation-context.entity.js';
import { IsolationLevel } from '../enums/isolation-level.enum.js';
import { TenantId } from '../value-objects/tenant-id.vo.js';
import { OrganizationId } from '../value-objects/organization-id.vo.js';
import { DepartmentId } from '../value-objects/department-id.vo.js';
import { UserId } from '../value-objects/user-id.vo.js';

describe('IsolationContext', () => {
  describe('createPlatform', () => {
    it('应该创建平台级隔离上下文', () => {
      const context = IsolationContext.createPlatform();

      expect(context.getIsolationLevel()).toBe(IsolationLevel.PLATFORM);
      expect(context.isEmpty()).toBe(true);
      expect(context.tenantId).toBeUndefined();
      expect(context.organizationId).toBeUndefined();
      expect(context.departmentId).toBeUndefined();
      expect(context.userId).toBeUndefined();
    });
  });

  describe('createTenant', () => {
    it('应该创建租户级隔离上下文', () => {
      const tenantId = TenantId.generate();
      
      const context = IsolationContext.createTenant(tenantId);

      expect(context.getIsolationLevel()).toBe(IsolationLevel.TENANT);
      expect(context.isEmpty()).toBe(false);
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBeUndefined();
    });
  });

  describe('createOrganization', () => {
    it('应该创建组织级隔离上下文', () => {
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      
      const context = IsolationContext.createOrganization(tenantId, orgId);

      expect(context.getIsolationLevel()).toBe(IsolationLevel.ORGANIZATION);
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(orgId);
    });

    it('缺少 tenantId 应该抛出错误', () => {
      const orgId = OrganizationId.generate();
      
      expect(() => 
        IsolationContext.createOrganization(undefined as any, orgId)
      ).toThrow('Invalid isolation context');
    });
  });

  describe('createDepartment', () => {
    it('应该创建部门级隔离上下文', () => {
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = DepartmentId.generate();
      
      const context = IsolationContext.createDepartment(tenantId, orgId, deptId);

      expect(context.getIsolationLevel()).toBe(IsolationLevel.DEPARTMENT);
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(orgId);
      expect(context.departmentId).toBe(deptId);
    });

    it('缺少必要层级应该抛出错误', () => {
      const deptId = DepartmentId.generate();
      
      expect(() => 
        IsolationContext.createDepartment(undefined as any, undefined as any, deptId)
      ).toThrow('Invalid isolation context');
    });
  });

  describe('createUser', () => {
    it('应该创建用户级隔离上下文', () => {
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = DepartmentId.generate();
      const userId = UserId.generate();
      
      const context = IsolationContext.createUser(tenantId, orgId, deptId, userId);

      expect(context.getIsolationLevel()).toBe(IsolationLevel.USER);
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(orgId);
      expect(context.departmentId).toBe(deptId);
      expect(context.userId).toBe(userId);
    });
  });

  describe('validate', () => {
    it('平台级上下文应该有效', () => {
      const context = IsolationContext.createPlatform();

      expect(context.validate()).toBe(true);
    });

    it('租户级上下文应该有效', () => {
      const tenantId = TenantId.generate();
      const context = IsolationContext.createTenant(tenantId);

      expect(context.validate()).toBe(true);
    });

    it('完整的层级关系应该有效', () => {
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const deptId = DepartmentId.generate();
      
      const context = IsolationContext.createDepartment(tenantId, orgId, deptId);

      expect(context.validate()).toBe(true);
    });
  });

  describe('toPlainObject', () => {
    it('应该转换为普通对象', () => {
      const tenantId = TenantId.generate();
      const orgId = OrganizationId.generate();
      const context = IsolationContext.createOrganization(tenantId, orgId);

      const plain = context.toPlainObject();

      expect(plain).toEqual({
        tenantId: tenantId.value,
        organizationId: orgId.value,
        departmentId: undefined,
        userId: undefined,
      });
    });
  });
});

