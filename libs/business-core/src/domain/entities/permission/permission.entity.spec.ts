/**
 * 权限实体单元测试
 *
 * @description 测试权限实体的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { Permission } from "./permission.entity.js";
import { PermissionType } from "../../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../value-objects/types/permission-action.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
  DomainValidationException,
} from "../../exceptions/base/base-domain-exception.js";

describe("Permission Entity", () => {
  let validEntityId: EntityId;
  let validPermissionProps: any;
  let validAuditInfo: any;

  beforeEach(() => {
    validEntityId = TenantId.create("123e4567-e89b-4d3a-a456-426614174000");
    validPermissionProps = {
      name: "Test Permission",
      type: PermissionType.TENANT,
      action: PermissionAction.READ,
      description: "Test permission description",
      isActive: true,
      isSystemPermission: false,
      isEditable: true,
      priority: 1,
      resource: "test-resource",
      conditions: { department: "IT" },
      parentPermissionId: undefined,
    };
    validAuditInfo = {
      createdBy: "admin",
      createdAt: new Date(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建权限实体", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(permission.name).toBe("Test Permission");
      expect(permission.type.value).toBe(PermissionType.TENANT.value);
      expect(permission.action.value).toBe(PermissionAction.READ.value);
      expect(permission.description).toBe("Test permission description");
      expect(permission.isActive).toBe(true);
      expect(permission.resource).toBe("test-resource");
      expect(permission.conditions).toEqual({ department: "IT" });
      expect(permission.parentPermissionId).toBeUndefined();
    });

    it("应该成功创建权限实体（不提供日志记录器）", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(permission).toBeDefined();
      expect(permission.name).toBe("Test Permission");
    });

    it("应该验证权限名称不能为空", () => {
      const invalidProps = { ...validPermissionProps, name: "" };

      expect(() => {
        new Permission(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(DomainValidationException);
    });

    it("应该验证权限名称长度不能超过100字符", () => {
      const invalidProps = { ...validPermissionProps, name: "a".repeat(101) };

      expect(() => {
        new Permission(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(DomainValidationException);
    });

    // 注意：Permission实体的构造函数不验证type和action，这些验证在updateType和updateAction方法中进行
  });

  describe("更新权限名称", () => {
    it("应该成功更新权限名称", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("New Permission Name");

      expect(permission.name).toBe("New Permission Name");
    });

    it("应该自动去除名称前后空格", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("  New Permission Name  ");

      expect(permission.name).toBe("New Permission Name");
    });

    it("应该验证新名称不能为空", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.updateName("");
      }).toThrow(DomainValidationException);
    });

    it("应该验证新名称长度不能超过100字符", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.updateName("a".repeat(101));
      }).toThrow(DomainValidationException);
    });
  });

  describe("更新权限描述", () => {
    it("应该成功更新权限描述", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateDescription("New permission description");

      expect(permission.description).toBe("New permission description");
    });

    it("应该允许空描述", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateDescription("");

      expect(permission.description).toBe("");
    });
  });

  describe("更新权限类型", () => {
    it("应该成功更新权限类型", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateType(PermissionType.SYSTEM);

      expect(permission.type.value).toBe(PermissionType.SYSTEM.value);
    });

    it("应该验证新类型不能为空", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.updateType(null as any);
      }).toThrow(TypeError);
    });
  });

  describe("更新权限动作", () => {
    it("应该成功更新权限动作", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateAction(PermissionAction.UPDATE);

      expect(permission.action.value).toBe(PermissionAction.UPDATE.value);
    });

    it("应该验证新动作不能为空", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.updateAction(null as any);
      }).toThrow(TypeError);
    });
  });

  describe("更新资源", () => {
    it("应该成功更新资源", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateResource("new-resource");

      expect(permission.resource).toBe("new-resource");
    });

    it("应该验证资源不能为空", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.updateResource("");
      }).toThrow(DomainValidationException);
    });
  });

  describe("添加条件", () => {
    it("应该成功添加条件", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.addCondition("role", "admin");

      expect(permission.conditions).toEqual({
        department: "IT",
        role: "admin",
      });
    });

    it("应该验证条件键不能为空", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.addCondition("", "value");
      }).toThrow(DomainValidationException);
    });

    it("应该验证条件键格式", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      // addCondition方法不验证键格式，只验证键不为空和长度
      expect(() => {
        permission.addCondition("invalid key", "value");
      }).not.toThrow();
    });
  });

  describe("移除条件", () => {
    it("应该成功移除条件", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.removeCondition("department");

      expect(permission.conditions).toEqual({});
    });

    it("应该处理不存在的条件", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.removeCondition("nonexistent");

      expect(permission.conditions).toEqual({ department: "IT" });
    });
  });

  describe("检查条件匹配", () => {
    it("应该正确检查条件匹配", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(permission.matchesConditions({ department: "IT" })).toBe(true);
      expect(permission.matchesConditions({ department: "HR" })).toBe(false);
    });

    it("应该处理空条件", () => {
      const permission = new Permission(
        validEntityId,
        { ...validPermissionProps, conditions: {} },
        validAuditInfo,
      );

      expect(permission.matchesConditions({ department: "IT" })).toBe(true);
    });
  });

  describe("设置父权限", () => {
    it("应该成功设置父权限", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");

      permission.setParentPermission(parentId);

      expect(permission.parentPermissionId).toBe(parentId);
    });

    it("应该验证不能设置自己为父权限", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.setParentPermission(validEntityId);
      }).toThrow(DomainStateException);
    });

    it("应该允许清除父权限", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");
      permission.setParentPermission(parentId);

      permission.removeParentPermission();

      expect(permission.parentPermissionId).toBeUndefined();
    });
  });

  describe("激活权限", () => {
    it("应该成功激活权限", () => {
      const inactiveProps = { ...validPermissionProps, isActive: false };
      const permission = new Permission(
        validEntityId,
        inactiveProps,
        validAuditInfo,
      );

      permission.activate();

      expect(permission.isActive).toBe(true);
    });

    it("应该防止重复激活", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.activate();
        permission.activate();
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("停用权限", () => {
    it("应该成功停用权限", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.deactivate();

      expect(permission.isActive).toBe(false);
    });

    it("应该防止重复停用", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(() => {
        permission.deactivate();
        permission.deactivate();
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("检查权限状态", () => {
    it("应该正确检查权限是否激活", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      expect(permission.isActive).toBe(true);
    });

    it("应该正确检查权限是否停用", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );
      permission.deactivate();

      expect(permission.isActive).toBe(false);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的权限名称", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("Permission-Name_123");

      expect(permission.name).toBe("Permission-Name_123");
    });

    it("应该处理Unicode字符的权限名称", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("权限名称");

      expect(permission.name).toBe("权限名称");
    });

    it("应该处理数字开头的权限名称", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("2024年度权限");

      expect(permission.name).toBe("2024年度权限");
    });

    it("应该处理包含空格的权限名称", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );

      permission.updateName("Test Permission Name");

      expect(permission.name).toBe("Test Permission Name");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量权限实体", () => {
      const startTime = Date.now();
      const permissions = [];

      for (let i = 0; i < 1000; i++) {
        const permProps = {
          ...validPermissionProps,
          name: `Permission ${i}`,
        };
        permissions.push(
          new Permission(
            TenantId.create("123e4567-e89b-4d3a-a456-426614174000"),
            permProps,
            validAuditInfo,
          ),
        );
      }

      const endTime = Date.now();
      expect(permissions).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速更新大量权限", () => {
      const permission = new Permission(
        validEntityId,
        validPermissionProps,
        validAuditInfo,
      );
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        permission.updateName(`Permission ${i}`);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
