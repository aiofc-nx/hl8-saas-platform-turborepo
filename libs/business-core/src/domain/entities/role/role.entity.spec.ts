/**
 * 角色实体单元测试
 *
 * @description 测试角色实体的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { Role } from "./role.entity.js";
import { RoleType } from "../../value-objects/types/role-type.vo.js";
import { PermissionType } from "../../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../value-objects/types/permission-action.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
  DomainValidationException,
} from "../../exceptions/base/base-domain-exception.js";

describe("Role Entity", () => {
  let validEntityId: EntityId;
  let validRoleProps: any;
  let validAuditInfo: any;

  beforeEach(() => {
    validEntityId = TenantId.create("123e4567-e89b-4d3a-a456-426614174000");
    validRoleProps = {
      name: "Test Role",
      description: "Test role description",
      type: RoleType.TENANT,
      permissionType: PermissionType.TENANT,
      actions: [PermissionAction.READ, PermissionAction.UPDATE],
      isActive: true,
      isSystemRole: false,
      isEditable: true,
      priority: 1,
      parentRoleId: undefined,
      tags: ["test", "role"],
      config: { maxUsers: 100 },
    };
    validAuditInfo = {
      createdBy: "admin",
      createdAt: new Date(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建角色实体", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(role.name).toBe("Test Role");
      expect(role.description).toBe("Test role description");
      expect(role.type.value).toBe(RoleType.TENANT.value);
      expect(role.permissionType.value).toBe(PermissionType.TENANT.value);
      expect(role.actions).toEqual([
        PermissionAction.READ,
        PermissionAction.UPDATE,
      ]);
      expect(role.isActive).toBe(true);
      expect(role.isSystemRole).toBe(false);
      expect(role.isEditable).toBe(true);
      expect(role.priority).toBe(1);
      expect(role.parentRoleId).toBeUndefined();
      expect(role.tags).toEqual(["test", "role"]);
      expect(role.config).toEqual({ maxUsers: 100 });
    });

    it("应该成功创建角色实体（不提供日志记录器）", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(role).toBeDefined();
      expect(role.name).toBe("Test Role");
    });

    it("应该验证角色名称不能为空", () => {
      const invalidProps = { ...validRoleProps, name: "" };

      expect(() => {
        new Role(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证角色名称长度不能超过100字符", () => {
      const invalidProps = { ...validRoleProps, name: "a".repeat(101) };

      expect(() => {
        new Role(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证角色描述长度不能超过500字符", () => {
      const invalidProps = { ...validRoleProps, description: "a".repeat(501) };

      expect(() => {
        new Role(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    // 注意：Role实体的构造函数不验证type和permissionType，这些验证在updateType和updatePermissionType方法中进行

    it("应该验证权限动作列表不能为空", () => {
      const invalidProps = { ...validRoleProps, actions: [] };

      expect(() => {
        new Role(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证权限动作不能重复", () => {
      const invalidProps = {
        ...validRoleProps,
        actions: [PermissionAction.READ, PermissionAction.READ],
      };

      expect(() => {
        new Role(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新角色名称", () => {
    it("应该成功更新角色名称", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("New Role Name");

      expect(role.name).toBe("New Role Name");
    });

    it("应该自动去除名称前后空格", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("  New Role Name  ");

      expect(role.name).toBe("New Role Name");
    });

    it("应该验证新名称不能为空", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updateName("");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新名称长度不能超过100字符", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updateName("a".repeat(101));
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新角色描述", () => {
    it("应该成功更新角色描述", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateDescription("New role description");

      expect(role.description).toBe("New role description");
    });

    it("应该允许空描述", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateDescription("");

      expect(role.description).toBe("");
    });

    it("应该验证描述长度不能超过500字符", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updateDescription("a".repeat(501));
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新角色类型", () => {
    it("应该成功更新角色类型", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateType(RoleType.SYSTEM);

      expect(role.type.value).toBe(RoleType.SYSTEM.value);
    });

    it("应该验证新类型不能为空", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updateType(null as any);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新权限类型", () => {
    it("应该成功更新权限类型", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updatePermissionType(PermissionType.ORGANIZATION);

      expect(role.permissionType.value).toBe(PermissionType.ORGANIZATION.value);
    });

    it("应该验证新权限类型不能为空", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updatePermissionType(null as any);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  // 注意：Role实体不支持动态添加/移除权限动作
  // 权限动作在创建时确定，不能动态修改

  describe("更新优先级", () => {
    it("应该成功更新优先级", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updatePriority(5);

      expect(role.priority).toBe(5);
    });

    it("应该验证优先级不能为负数", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.updatePriority(-1);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("设置父角色", () => {
    it("应该成功设置父角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");

      role.setParentRole(parentId);

      expect(role.parentRoleId).toBe(parentId);
    });

    it("应该验证不能设置自己为父角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(() => {
        role.setParentRole(validEntityId);
      }).toThrow(DomainStateException);
    });

    it("应该允许清除父角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");
      role.setParentRole(parentId);

      role.removeParentRole();

      expect(role.parentRoleId).toBeUndefined();
    });
  });

  describe("添加标签", () => {
    it("应该成功添加标签", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.addTag("new-tag");

      expect(role.tags).toContain("new-tag");
    });

    it("应该防止重复添加标签", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.addTag("test");

      expect(role.tags).toEqual(["test", "role"]);
    });
  });

  describe("移除标签", () => {
    it("应该成功移除标签", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.removeTag("test");

      expect(role.tags).not.toContain("test");
    });

    it("应该处理不存在的标签", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.removeTag("nonexistent");

      expect(role.tags).toEqual(["test", "role"]);
    });
  });

  describe("更新配置", () => {
    it("应该成功更新配置", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateConfig({ maxUsers: 200, timeout: 30 });

      expect(role.config).toEqual({ maxUsers: 200, timeout: 30 });
    });

    it("应该允许空配置", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateConfig({});

      expect(role.config).toEqual({});
    });
  });

  describe("激活角色", () => {
    it("应该成功激活角色", () => {
      const inactiveProps = { ...validRoleProps, isActive: false };
      const role = new Role(validEntityId, inactiveProps, validAuditInfo);

      role.activate();

      expect(role.isActive).toBe(true);
    });
  });

  describe("停用角色", () => {
    it("应该成功停用角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.deactivate();

      expect(role.isActive).toBe(false);
    });
  });

  describe("检查角色状态", () => {
    it("应该正确检查角色是否激活", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(role.isActive).toBe(true);
    });

    it("应该正确检查角色是否停用", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);
      role.deactivate();

      expect(role.isActive).toBe(false);
    });

    it("应该正确检查角色是否可编辑", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(role.isEditable).toBe(true);
    });

    it("应该正确检查角色是否为系统角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      expect(role.isSystemRole).toBe(false);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的角色名称", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("Role-Name_123");

      expect(role.name).toBe("Role-Name_123");
    });

    it("应该处理Unicode字符的角色名称", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("管理员角色");

      expect(role.name).toBe("管理员角色");
    });

    it("应该处理数字开头的角色名称", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("2024年度角色");

      expect(role.name).toBe("2024年度角色");
    });

    it("应该处理包含空格的角色名称", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);

      role.updateName("Test Role Name");

      expect(role.name).toBe("Test Role Name");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量角色实体", () => {
      const startTime = Date.now();
      const roles = [];

      for (let i = 0; i < 1000; i++) {
        const roleProps = {
          ...validRoleProps,
          name: `Role ${i}`,
        };
        roles.push(
          new Role(
            TenantId.create("123e4567-e89b-4d3a-a456-426614174000"),
            roleProps,
            validAuditInfo,
          ),
        );
      }

      const endTime = Date.now();
      expect(roles).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速更新大量角色", () => {
      const role = new Role(validEntityId, validRoleProps, validAuditInfo);
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        role.updateName(`Role ${i}`);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
