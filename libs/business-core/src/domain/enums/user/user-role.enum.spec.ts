/**
 * 用户角色枚举测试
 *
 * @description 测试用户角色枚举和工具类的功能
 * @since 1.0.0
 */

import { UserRole, UserRoleUtils } from "./user-role.enum.js";

describe("UserRole", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的角色", () => {
      expect(UserRole.SUPER_ADMIN).toBe("SUPER_ADMIN");
      expect(UserRole.SYSTEM_ADMIN).toBe("SYSTEM_ADMIN");
      expect(UserRole.TENANT_ADMIN).toBe("TENANT_ADMIN");
      expect(UserRole.ORGANIZATION_ADMIN).toBe("ORGANIZATION_ADMIN");
      expect(UserRole.DEPARTMENT_ADMIN).toBe("DEPARTMENT_ADMIN");
      expect(UserRole.USER).toBe("USER");
      expect(UserRole.GUEST).toBe("GUEST");
    });
  });
});

describe("UserRoleUtils", () => {
  describe("isAdmin", () => {
    it("应该正确识别管理员角色", () => {
      expect(UserRoleUtils.isAdmin(UserRole.SUPER_ADMIN)).toBe(true);
      expect(UserRoleUtils.isAdmin(UserRole.SYSTEM_ADMIN)).toBe(true);
      expect(UserRoleUtils.isAdmin(UserRole.TENANT_ADMIN)).toBe(true);
      expect(UserRoleUtils.isAdmin(UserRole.ORGANIZATION_ADMIN)).toBe(true);
      expect(UserRoleUtils.isAdmin(UserRole.DEPARTMENT_ADMIN)).toBe(true);
    });

    it("应该正确识别非管理员角色", () => {
      expect(UserRoleUtils.isAdmin(UserRole.USER)).toBe(false);
      expect(UserRoleUtils.isAdmin(UserRole.GUEST)).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("应该正确识别超级管理员", () => {
      expect(UserRoleUtils.isSuperAdmin(UserRole.SUPER_ADMIN)).toBe(true);
      expect(UserRoleUtils.isSuperAdmin(UserRole.SYSTEM_ADMIN)).toBe(false);
      expect(UserRoleUtils.isSuperAdmin(UserRole.USER)).toBe(false);
    });
  });

  describe("isSystemAdmin", () => {
    it("应该正确识别系统管理员", () => {
      expect(UserRoleUtils.isSystemAdmin(UserRole.SYSTEM_ADMIN)).toBe(true);
      expect(UserRoleUtils.isSystemAdmin(UserRole.SUPER_ADMIN)).toBe(false);
      expect(UserRoleUtils.isSystemAdmin(UserRole.USER)).toBe(false);
    });
  });

  describe("isTenantAdmin", () => {
    it("应该正确识别租户管理员", () => {
      expect(UserRoleUtils.isTenantAdmin(UserRole.TENANT_ADMIN)).toBe(true);
      expect(UserRoleUtils.isTenantAdmin(UserRole.SUPER_ADMIN)).toBe(false);
      expect(UserRoleUtils.isTenantAdmin(UserRole.USER)).toBe(false);
    });
  });

  describe("hasHigherRole", () => {
    it("应该正确比较角色层级", () => {
      expect(
        UserRoleUtils.hasHigherRole(UserRole.SUPER_ADMIN, UserRole.USER),
      ).toBe(true);
      expect(
        UserRoleUtils.hasHigherRole(
          UserRole.SYSTEM_ADMIN,
          UserRole.TENANT_ADMIN,
        ),
      ).toBe(true);
      expect(
        UserRoleUtils.hasHigherRole(UserRole.USER, UserRole.SUPER_ADMIN),
      ).toBe(false);
      expect(UserRoleUtils.hasHigherRole(UserRole.USER, UserRole.USER)).toBe(
        false,
      );
    });
  });

  describe("hasRoleOrHigher", () => {
    it("应该正确比较角色层级（包含相等）", () => {
      expect(
        UserRoleUtils.hasRoleOrHigher(UserRole.SUPER_ADMIN, UserRole.USER),
      ).toBe(true);
      expect(UserRoleUtils.hasRoleOrHigher(UserRole.USER, UserRole.USER)).toBe(
        true,
      );
      expect(
        UserRoleUtils.hasRoleOrHigher(UserRole.USER, UserRole.SUPER_ADMIN),
      ).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(UserRoleUtils.getDescription(UserRole.SUPER_ADMIN)).toBe(
        "超级管理员",
      );
      expect(UserRoleUtils.getDescription(UserRole.SYSTEM_ADMIN)).toBe(
        "系统管理员",
      );
      expect(UserRoleUtils.getDescription(UserRole.TENANT_ADMIN)).toBe(
        "租户管理员",
      );
      expect(UserRoleUtils.getDescription(UserRole.ORGANIZATION_ADMIN)).toBe(
        "组织管理员",
      );
      expect(UserRoleUtils.getDescription(UserRole.DEPARTMENT_ADMIN)).toBe(
        "部门管理员",
      );
      expect(UserRoleUtils.getDescription(UserRole.USER)).toBe("普通用户");
      expect(UserRoleUtils.getDescription(UserRole.GUEST)).toBe("访客");
    });
  });

  describe("getAllRoles", () => {
    it("应该返回所有角色", () => {
      const allRoles = UserRoleUtils.getAllRoles();
      expect(allRoles).toHaveLength(7);
      expect(allRoles).toContain(UserRole.SUPER_ADMIN);
      expect(allRoles).toContain(UserRole.SYSTEM_ADMIN);
      expect(allRoles).toContain(UserRole.TENANT_ADMIN);
      expect(allRoles).toContain(UserRole.ORGANIZATION_ADMIN);
      expect(allRoles).toContain(UserRole.DEPARTMENT_ADMIN);
      expect(allRoles).toContain(UserRole.USER);
      expect(allRoles).toContain(UserRole.GUEST);
    });
  });

  describe("getAdminRoles", () => {
    it("应该返回所有管理员角色", () => {
      const adminRoles = UserRoleUtils.getAdminRoles();
      expect(adminRoles).toHaveLength(5);
      expect(adminRoles).toContain(UserRole.SUPER_ADMIN);
      expect(adminRoles).toContain(UserRole.SYSTEM_ADMIN);
      expect(adminRoles).toContain(UserRole.TENANT_ADMIN);
      expect(adminRoles).toContain(UserRole.ORGANIZATION_ADMIN);
      expect(adminRoles).toContain(UserRole.DEPARTMENT_ADMIN);
      expect(adminRoles).not.toContain(UserRole.USER);
      expect(adminRoles).not.toContain(UserRole.GUEST);
    });
  });
});
