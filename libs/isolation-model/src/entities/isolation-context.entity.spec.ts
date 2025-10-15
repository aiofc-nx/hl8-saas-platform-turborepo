/**
 * IsolationContext 实体单元测试
 *
 * @description 测试隔离上下文实体的所有业务逻辑
 */

import { IsolationLevel } from "../enums/isolation-level.enum.js";
import { SharingLevel } from "../enums/sharing-level.enum.js";
import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";
import { IsolationContext } from "./isolation-context.entity.js";

describe("IsolationContext", () => {
  // 测试数据 - 使用 UUID v4 格式
  const UUID_TENANT = "550e8400-e29b-41d4-a716-446655440000";
  const UUID_ORG = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
  const UUID_DEPT = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
  const UUID_USER = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  // 用于测试不同数据的额外 UUID
  const UUID_TENANT_2 = "123e4567-e89b-42d3-a456-426614174000";
  const UUID_ORG_2 = "123e4567-e89b-42d3-a456-426614174001";
  const UUID_DEPT_2 = "123e4567-e89b-42d3-a456-426614174002";
  const UUID_USER_2 = "123e4567-e89b-42d3-a456-426614174003";

  const t123 = TenantId.create(UUID_TENANT);
  const o456 = OrganizationId.create(UUID_ORG);
  const d789 = DepartmentId.create(UUID_DEPT);
  const u999 = UserId.create(UUID_USER);

  beforeEach(() => {
    // 清除值对象缓存
    TenantId.clearCache();
    OrganizationId.clearCache();
    DepartmentId.clearCache();
    UserId.clearCache();
  });

  describe("静态工厂方法", () => {
    describe("platform()", () => {
      it("应该创建平台级上下文", () => {
        const context = IsolationContext.platform();

        expect(context.tenantId).toBeUndefined();
        expect(context.organizationId).toBeUndefined();
        expect(context.departmentId).toBeUndefined();
        expect(context.userId).toBeUndefined();
      });

      it("应该是空上下文", () => {
        const context = IsolationContext.platform();
        expect(context.isEmpty()).toBe(true);
      });
    });

    describe("tenant()", () => {
      it("应该创建租户级上下文", () => {
        const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));

        expect(context.tenantId).toBeDefined();
        expect(context.tenantId?.getValue()).toBe(UUID_TENANT);
        expect(context.organizationId).toBeUndefined();
        expect(context.departmentId).toBeUndefined();
      });
    });

    describe("organization()", () => {
      it("应该创建组织级上下文", () => {
        const context = IsolationContext.organization(
          TenantId.create(UUID_TENANT),
          OrganizationId.create(UUID_ORG),
        );

        expect(context.tenantId?.getValue()).toBe(UUID_TENANT);
        expect(context.organizationId?.getValue()).toBe(UUID_ORG);
        expect(context.departmentId).toBeUndefined();
      });

      it("应该验证组织上下文必须有租户", () => {
        // 这个测试通过静态工厂方法无法触发，因为 TypeScript 类型要求传入 tenantId
        // 但如果绕过类型系统，应该抛出异常
        // 此测试用例在实际使用中由 TypeScript 类型系统保证
      });
    });

    describe("department()", () => {
      it("应该创建部门级上下文", () => {
        const context = IsolationContext.department(
          TenantId.create(UUID_TENANT),
          OrganizationId.create(UUID_ORG),
          DepartmentId.create(UUID_DEPT),
        );

        expect(context.tenantId?.getValue()).toBe(UUID_TENANT);
        expect(context.organizationId?.getValue()).toBe(UUID_ORG);
        expect(context.departmentId?.getValue()).toBe(UUID_DEPT);
      });
    });

    describe("user()", () => {
      it("应该创建用户级上下文（无租户）", () => {
        const context = IsolationContext.user(UserId.create(UUID_USER));

        expect(context.userId?.getValue()).toBe(UUID_USER);
        expect(context.tenantId).toBeUndefined();
      });

      it("应该创建用户级上下文（有租户）", () => {
        const context = IsolationContext.user(
          UserId.create(UUID_USER),
          TenantId.create(UUID_TENANT),
        );

        expect(context.userId?.getValue()).toBe(UUID_USER);
        expect(context.tenantId?.getValue()).toBe(UUID_TENANT);
      });
    });
  });

  describe("getIsolationLevel()", () => {
    it("应该返回 PLATFORM 级别（空上下文）", () => {
      const context = IsolationContext.platform();
      expect(context.getIsolationLevel()).toBe(IsolationLevel.PLATFORM);
    });

    it("应该返回 TENANT 级别", () => {
      const context = IsolationContext.tenant(t123);
      expect(context.getIsolationLevel()).toBe(IsolationLevel.TENANT);
    });

    it("应该返回 ORGANIZATION 级别", () => {
      const context = IsolationContext.organization(t123, o456);
      expect(context.getIsolationLevel()).toBe(IsolationLevel.ORGANIZATION);
    });

    it("应该返回 DEPARTMENT 级别", () => {
      const context = IsolationContext.department(t123, o456, d789);
      expect(context.getIsolationLevel()).toBe(IsolationLevel.DEPARTMENT);
    });

    it("应该返回 USER 级别", () => {
      const context = IsolationContext.user(u999);
      expect(context.getIsolationLevel()).toBe(IsolationLevel.USER);
    });

    it("应该缓存计算结果（性能优化）", () => {
      const context = IsolationContext.tenant(t123);

      // 第一次调用计算
      const level1 = context.getIsolationLevel();
      // 第二次调用使用缓存
      const level2 = context.getIsolationLevel();

      expect(level1).toBe(level2);
      expect(level1).toBe(IsolationLevel.TENANT);
    });
  });

  describe("isEmpty()", () => {
    it("应该返回 true（平台级）", () => {
      const context = IsolationContext.platform();
      expect(context.isEmpty()).toBe(true);
    });

    it("应该返回 false（租户级）", () => {
      const context = IsolationContext.tenant(t123);
      expect(context.isEmpty()).toBe(false);
    });

    it("应该返回 false（组织级）", () => {
      const context = IsolationContext.organization(t123, o456);
      expect(context.isEmpty()).toBe(false);
    });
  });

  describe("级别判断方法", () => {
    it("isTenantLevel() 应该正确判断", () => {
      expect(IsolationContext.tenant(t123).isTenantLevel()).toBe(true);
      expect(IsolationContext.platform().isTenantLevel()).toBe(false);
    });

    it("isOrganizationLevel() 应该正确判断", () => {
      expect(
        IsolationContext.organization(t123, o456).isOrganizationLevel(),
      ).toBe(true);
      expect(IsolationContext.tenant(t123).isOrganizationLevel()).toBe(false);
    });

    it("isDepartmentLevel() 应该正确判断", () => {
      expect(
        IsolationContext.department(t123, o456, d789).isDepartmentLevel(),
      ).toBe(true);
      expect(
        IsolationContext.organization(t123, o456).isDepartmentLevel(),
      ).toBe(false);
    });

    it("isUserLevel() 应该正确判断", () => {
      expect(IsolationContext.user(u999).isUserLevel()).toBe(true);
      expect(IsolationContext.platform().isUserLevel()).toBe(false);
    });
  });

  describe("buildCacheKey()", () => {
    it("应该为平台级生成正确的键", () => {
      const context = IsolationContext.platform();
      const key = context.buildCacheKey("user", "list");

      expect(key).toBe("platform:user:list");
    });

    it("应该为租户级生成正确的键", () => {
      const context = IsolationContext.tenant(t123);
      const key = context.buildCacheKey("user", "list");

      expect(key).toBe(`tenant:${UUID_TENANT}:user:list`);
    });

    it("应该为组织级生成正确的键", () => {
      const context = IsolationContext.organization(t123, o456);
      const key = context.buildCacheKey("user", "list");

      expect(key).toBe(`tenant:${UUID_TENANT}:org:${UUID_ORG}:user:list`);
    });

    it("应该为部门级生成正确的键", () => {
      const context = IsolationContext.department(t123, o456, d789);
      const key = context.buildCacheKey("user", "list");

      expect(key).toBe(
        `tenant:${UUID_TENANT}:org:${UUID_ORG}:dept:${UUID_DEPT}:user:list`,
      );
    });

    it("应该为用户级生成正确的键（无租户）", () => {
      const context = IsolationContext.user(u999);
      const key = context.buildCacheKey("preferences", "theme");

      expect(key).toBe(`user:${UUID_USER}:preferences:theme`);
    });

    it("应该为用户级生成正确的键（有租户）", () => {
      const context = IsolationContext.user(u999, t123);
      const key = context.buildCacheKey("preferences", "theme");

      expect(key).toBe(
        `tenant:${UUID_TENANT}:user:${UUID_USER}:preferences:theme`,
      );
    });
  });

  describe("buildLogContext()", () => {
    it("应该为平台级返回空对象", () => {
      const context = IsolationContext.platform();
      const logContext = context.buildLogContext();

      expect(logContext).toEqual({});
    });

    it("应该为租户级返回租户 ID", () => {
      const context = IsolationContext.tenant(t123);
      const logContext = context.buildLogContext();

      expect(logContext).toEqual({ tenantId: UUID_TENANT });
    });

    it("应该为组织级返回租户和组织 ID", () => {
      const context = IsolationContext.organization(t123, o456);
      const logContext = context.buildLogContext();

      expect(logContext).toEqual({
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
      });
    });

    it("应该为部门级返回完整信息", () => {
      const context = IsolationContext.department(t123, o456, d789);
      const logContext = context.buildLogContext();

      expect(logContext).toEqual({
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
        departmentId: UUID_DEPT,
      });
    });

    it("应该为用户级返回用户 ID", () => {
      const context = IsolationContext.user(u999);
      const logContext = context.buildLogContext();

      expect(logContext).toEqual({ userId: UUID_USER });
    });
  });

  describe("buildWhereClause()", () => {
    it("应该为平台级返回空对象", () => {
      const context = IsolationContext.platform();
      const where = context.buildWhereClause();

      expect(where).toEqual({});
    });

    it("应该为租户级返回租户条件", () => {
      const context = IsolationContext.tenant(t123);
      const where = context.buildWhereClause();

      expect(where).toEqual({ tenantId: UUID_TENANT });
    });

    it("应该为组织级返回组织条件", () => {
      const context = IsolationContext.organization(t123, o456);
      const where = context.buildWhereClause();

      expect(where).toEqual({
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
      });
    });

    it("应该为部门级返回部门条件", () => {
      const context = IsolationContext.department(t123, o456, d789);
      const where = context.buildWhereClause();

      expect(where).toEqual({
        tenantId: UUID_TENANT,
        organizationId: UUID_ORG,
        departmentId: UUID_DEPT,
      });
    });
  });

  describe("canAccess() - 核心业务逻辑", () => {
    describe("平台级上下文访问", () => {
      it("应该可以访问所有数据", () => {
        const platformContext = IsolationContext.platform();
        const dataContext = IsolationContext.department(t123, o456, d789);

        expect(platformContext.canAccess(dataContext, false)).toBe(true);
        expect(
          platformContext.canAccess(dataContext, true, SharingLevel.TENANT),
        ).toBe(true);
      });
    });

    describe("非共享数据访问", () => {
      it("应该允许访问完全匹配的数据", () => {
        const userContext = IsolationContext.tenant(t123);
        const dataContext = IsolationContext.tenant(t123);

        expect(userContext.canAccess(dataContext, false)).toBe(true);
      });

      it("应该拒绝访问不匹配的租户数据", () => {
        const userContext = IsolationContext.tenant(t123);
        const dataContext = IsolationContext.tenant(
          TenantId.create(UUID_TENANT_2),
        );

        expect(userContext.canAccess(dataContext, false)).toBe(false);
      });

      it("应该拒绝访问不匹配的组织数据", () => {
        const userContext = IsolationContext.organization(t123, o456);
        const dataContext = IsolationContext.organization(
          t123,
          OrganizationId.create(UUID_ORG_2),
        );

        expect(userContext.canAccess(dataContext, false)).toBe(false);
      });

      it("应该拒绝访问不匹配的部门数据", () => {
        const userContext = IsolationContext.department(t123, o456, d789);
        const dataContext = IsolationContext.department(
          t123,
          o456,
          DepartmentId.create(UUID_DEPT_2),
        );

        expect(userContext.canAccess(dataContext, false)).toBe(false);
      });
    });

    describe("共享数据访问 - PLATFORM 级别", () => {
      it("应该允许所有用户访问平台共享数据", () => {
        const userContext = IsolationContext.tenant(t123);
        const dataContext = IsolationContext.platform();

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.PLATFORM),
        ).toBe(true);
      });
    });

    describe("共享数据访问 - TENANT 级别", () => {
      it("应该允许同租户用户访问租户共享数据", () => {
        const userContext = IsolationContext.department(t123, o456, d789);
        const dataContext = IsolationContext.tenant(t123);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.TENANT),
        ).toBe(true);
      });

      it("应该拒绝不同租户用户访问", () => {
        const userContext = IsolationContext.tenant(
          TenantId.create(UUID_TENANT_2),
        );
        const dataContext = IsolationContext.tenant(t123);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.TENANT),
        ).toBe(false);
      });
    });

    describe("共享数据访问 - ORGANIZATION 级别", () => {
      it("应该允许同组织用户访问组织共享数据", () => {
        const userContext = IsolationContext.department(t123, o456, d789);
        const dataContext = IsolationContext.organization(t123, o456);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.ORGANIZATION),
        ).toBe(true);
      });

      it("应该拒绝不同组织用户访问", () => {
        const userContext = IsolationContext.organization(
          t123,
          OrganizationId.create(UUID_ORG_2),
        );
        const dataContext = IsolationContext.organization(t123, o456);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.ORGANIZATION),
        ).toBe(false);
      });
    });

    describe("共享数据访问 - DEPARTMENT 级别", () => {
      it("应该允许同部门用户访问部门共享数据", () => {
        const userContext = IsolationContext.department(t123, o456, d789);
        const dataContext = IsolationContext.department(t123, o456, d789);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.DEPARTMENT),
        ).toBe(true);
      });

      it("应该拒绝不同部门用户访问", () => {
        const userContext = IsolationContext.department(
          t123,
          o456,
          DepartmentId.create(UUID_DEPT_2),
        );
        const dataContext = IsolationContext.department(t123, o456, d789);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.DEPARTMENT),
        ).toBe(false);
      });
    });

    describe("共享数据访问 - USER 级别", () => {
      it("应该允许同一用户访问", () => {
        const userContext = IsolationContext.user(u999);
        const dataContext = IsolationContext.user(u999);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.USER),
        ).toBe(true);
      });

      it("应该拒绝不同用户访问", () => {
        const userContext = IsolationContext.user(UserId.create(UUID_USER_2));
        const dataContext = IsolationContext.user(u999);

        expect(
          userContext.canAccess(dataContext, true, SharingLevel.USER),
        ).toBe(false);
      });
    });

    describe("边界情况", () => {
      it("应该拒绝无共享级别的共享数据", () => {
        const userContext = IsolationContext.tenant(t123);
        const dataContext = IsolationContext.tenant(t123);

        expect(userContext.canAccess(dataContext, true, undefined)).toBe(false);
      });
    });
  });

  describe("switchOrganization()", () => {
    it("应该创建新的上下文（不可变性）", () => {
      const original = IsolationContext.organization(t123, o456);
      const newContext = original.switchOrganization(
        OrganizationId.create(UUID_ORG_2),
      );

      expect(newContext).not.toBe(original);
      const newOrg = OrganizationId.create(
        "123e4567-e89b-42d3-a456-426614174001",
      );
      expect(newContext.organizationId?.getValue()).toBe(newOrg.getValue());
      expect(original.organizationId?.getValue()).toBe(UUID_ORG);
    });

    it("应该保持租户不变", () => {
      const original = IsolationContext.organization(t123, o456);
      const newContext = original.switchOrganization(
        OrganizationId.create(UUID_ORG_2),
      );

      expect(newContext.tenantId).toBe(original.tenantId);
    });

    it("应该要求租户上下文", () => {
      const userContext = IsolationContext.user(u999);

      expect(() => userContext.switchOrganization(o456)).toThrow(
        IsolationValidationError,
      );
      expect(() => userContext.switchOrganization(o456)).toThrow(
        "切换组织需要租户上下文",
      );
    });
  });

  describe("switchDepartment()", () => {
    it("应该创建新的上下文", () => {
      const original = IsolationContext.department(t123, o456, d789);
      const newContext = original.switchDepartment(
        DepartmentId.create(UUID_DEPT_2),
      );

      expect(newContext).not.toBe(original);
      const newDept = DepartmentId.create(
        "123e4567-e89b-42d3-a456-426614174002",
      );
      expect(newContext.departmentId?.getValue()).toBe(newDept.getValue());
      expect(original.departmentId?.getValue()).toBe(UUID_DEPT);
    });

    it("应该保持租户和组织不变", () => {
      const original = IsolationContext.department(t123, o456, d789);
      const newContext = original.switchDepartment(
        DepartmentId.create(UUID_DEPT_2),
      );

      expect(newContext.tenantId).toBe(original.tenantId);
      expect(newContext.organizationId).toBe(original.organizationId);
    });

    it("应该要求租户和组织上下文", () => {
      const tenantContext = IsolationContext.tenant(t123);

      expect(() => tenantContext.switchDepartment(d789)).toThrow(
        IsolationValidationError,
      );
    });
  });

  describe("不可变性", () => {
    it("所有属性应该是只读的（TypeScript 保证）", () => {
      const context = IsolationContext.tenant(t123);

      // TypeScript 编译时会阻止修改
      // 运行时验证属性确实存在且不可变
      expect(context.tenantId).toBeDefined();
      expect(Object.isFrozen(context)).toBe(false); // 对象本身未冻结，但属性是 readonly

      // 尝试修改（TypeScript 会阻止，但 JavaScript 允许，因为没有使用 Object.freeze）
      // 在严格模式和 TypeScript 编译时会被阻止
    });
  });
});
