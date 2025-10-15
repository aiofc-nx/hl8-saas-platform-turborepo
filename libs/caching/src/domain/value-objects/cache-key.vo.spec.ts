/**
 * CacheKey 值对象单元测试
 *
 * @description 测试缓存键生成、验证和业务逻辑
 *
 * @group domain/value-objects
 */

import {
  DepartmentId,
  IsolationContext,
  OrganizationId,
  TenantId,
  UserId,
} from "@hl8/isolation-model";
import { CacheLevel } from "../../types/cache-level.enum.js";
import { CacheKey } from "./cache-key.vo.js";

describe("CacheKey", () => {
  const UUID_TENANT = "550e8400-e29b-41d4-a716-446655440000";
  const UUID_ORG = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
  const UUID_DEPT = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
  const UUID_USER = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  const PREFIX = "hl8:cache:";

  describe("forPlatform()", () => {
    it("应该创建平台级缓存键", () => {
      const key = CacheKey.forPlatform("system", "version", PREFIX);

      expect(key.toString()).toBe(`${PREFIX}platform:system:version`);
      expect(key.getLevel()).toBe(CacheLevel.PLATFORM);
    });
  });

  describe("forTenant()", () => {
    it("应该创建租户级缓存键", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      const key = CacheKey.forTenant("config", "flags", PREFIX, context);

      expect(key.toString()).toBe(
        `${PREFIX}tenant:${UUID_TENANT}:config:flags`,
      );
      expect(key.getLevel()).toBe(CacheLevel.TENANT);
    });

    it("应该拒绝没有 tenantId 的上下文", () => {
      const context = IsolationContext.platform();

      expect(() => {
        CacheKey.forTenant("config", "flags", PREFIX, context);
      }).toThrow();
    });
  });

  describe("forOrganization()", () => {
    it("应该创建组织级缓存键", () => {
      const context = IsolationContext.organization(
        TenantId.create(UUID_TENANT),
        OrganizationId.create(UUID_ORG),
      );
      const key = CacheKey.forOrganization("members", "list", PREFIX, context);

      expect(key.toString()).toBe(
        `${PREFIX}tenant:${UUID_TENANT}:org:${UUID_ORG}:members:list`,
      );
      expect(key.getLevel()).toBe(CacheLevel.ORGANIZATION);
    });

    it("应该拒绝没有 organizationId 的上下文", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));

      expect(() => {
        CacheKey.forOrganization("members", "list", PREFIX, context);
      }).toThrow();
    });
  });

  describe("forDepartment()", () => {
    it("应该创建部门级缓存键", () => {
      const context = IsolationContext.department(
        TenantId.create(UUID_TENANT),
        OrganizationId.create(UUID_ORG),
        DepartmentId.create(UUID_DEPT),
      );
      const key = CacheKey.forDepartment("tasks", "active", PREFIX, context);

      expect(key.toString()).toBe(
        `${PREFIX}tenant:${UUID_TENANT}:org:${UUID_ORG}:dept:${UUID_DEPT}:tasks:active`,
      );
      expect(key.getLevel()).toBe(CacheLevel.DEPARTMENT);
    });
  });

  describe("forUser()", () => {
    it("应该创建用户级缓存键", () => {
      const context = IsolationContext.user(UserId.create(UUID_USER));
      const key = CacheKey.forUser("preferences", "theme", PREFIX, context);

      expect(key.toString()).toBe(
        `${PREFIX}user:${UUID_USER}:preferences:theme`,
      );
      expect(key.getLevel()).toBe(CacheLevel.USER);
    });
  });

  describe("fromContext()", () => {
    it("应该自动判断平台级", () => {
      const context = IsolationContext.platform();
      const key = CacheKey.fromContext("system", "config", PREFIX, context);

      expect(key.getLevel()).toBe(CacheLevel.PLATFORM);
    });

    it("应该自动判断租户级", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      const key = CacheKey.fromContext("user", "list", PREFIX, context);

      expect(key.getLevel()).toBe(CacheLevel.TENANT);
      expect(key.toString()).toContain(`tenant:${UUID_TENANT}`);
    });

    it("应该自动判断组织级", () => {
      const context = IsolationContext.organization(
        TenantId.create(UUID_TENANT),
        OrganizationId.create(UUID_ORG),
      );
      const key = CacheKey.fromContext("members", "list", PREFIX, context);

      expect(key.getLevel()).toBe(CacheLevel.ORGANIZATION);
    });

    it("应该自动判断部门级（最高优先级）", () => {
      const context = IsolationContext.department(
        TenantId.create(UUID_TENANT),
        OrganizationId.create(UUID_ORG),
        DepartmentId.create(UUID_DEPT),
      );
      const key = CacheKey.fromContext("tasks", "list", PREFIX, context);

      expect(key.getLevel()).toBe(CacheLevel.DEPARTMENT);
    });

    it("应该自动判断用户级", () => {
      const context = IsolationContext.user(UserId.create(UUID_USER));
      const key = CacheKey.fromContext("preferences", "theme", PREFIX, context);

      expect(key.getLevel()).toBe(CacheLevel.USER);
    });
  });

  describe("toPattern()", () => {
    it("应该生成平台级匹配模式", () => {
      const key = CacheKey.forPlatform("system", "config", PREFIX);
      const pattern = key.toPattern();

      // toPattern() 在键末尾添加通配符
      expect(pattern).toBe(`${PREFIX}platform:system:config*`);
    });

    it("应该生成租户级匹配模式", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      const key = CacheKey.forTenant("config", "flags", PREFIX, context);
      const pattern = key.toPattern();

      expect(pattern).toBe(`${PREFIX}tenant:${UUID_TENANT}:config:flags*`);
    });
  });

  describe("equals()", () => {
    it("应该正确比较相等的键", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      const key1 = CacheKey.forTenant("user", "list", PREFIX, context);
      const key2 = CacheKey.forTenant("user", "list", PREFIX, context);

      expect(key1.equals(key2)).toBe(true);
    });

    it("应该正确比较不同的键", () => {
      const context = IsolationContext.tenant(TenantId.create(UUID_TENANT));
      const key1 = CacheKey.forTenant("user", "list", PREFIX, context);
      const key2 = CacheKey.forTenant("user", "profile", PREFIX, context);

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe("键格式验证", () => {
    it("应该允许合理长度的键", () => {
      const namespace = "system";
      const key = "config";

      expect(() => {
        CacheKey.forPlatform(namespace, key, PREFIX);
      }).not.toThrow();
    });
  });
});
