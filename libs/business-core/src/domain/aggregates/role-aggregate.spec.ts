import { EntityId, TenantId } from "@hl8/isolation-model";
import { RoleAggregate } from "./role-aggregate.js";
import { Role } from "../entities/role/role.entity.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { RoleType } from "../value-objects/types/role-type.vo.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("RoleAggregate", () => {
  let validEntityId: EntityId;
  let validRole: Role;
  let validPermission: Permission;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    validAuditInfo = {
      createdBy: "test-user",
    };

    validRole = new Role(
      TenantId.create("550e8400-e29b-41d4-a716-446655440001"),
      {
        name: "test-role",
        description: "Test role description",
        type: RoleType.create("TENANT"),
        permissionType: PermissionType.create("TENANT"),
        actions: [
          PermissionAction.create("READ"),
          PermissionAction.create("UPDATE"),
        ],
        priority: 1,
        parentRoleId: undefined,
        tags: ["test"],
        config: {},
        isActive: true,
      },
      validAuditInfo,
    );

    validPermission = new Permission(
      TenantId.create("550e8400-e29b-41d4-a716-446655440002"),
      {
        name: "test-permission",
        description: "Test permission description",
        type: PermissionType.create("TENANT"),
        action: PermissionAction.create("READ"),
        isSystemPermission: false,
        isEditable: true,
        resource: "test-resource",
        resourceId: undefined,
        conditions: {},
        parentPermissionId: undefined,
        priority: 1,
        isActive: true,
      },
      validAuditInfo,
    );

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建角色聚合根", () => {
      const aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );

      expect(aggregate).toBeDefined();
      expect(aggregate.getRole()).toBe(validRole);
      expect(aggregate.getPermissions()).toEqual([]);
      expect(aggregate.getChildRoles()).toEqual([]);
    });
  });

  describe("角色管理", () => {
    let aggregate: RoleAggregate;

    beforeEach(() => {
      aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该更新角色信息", () => {
      const newName = "new-role-name";
      const newDescription = "New role description";

      aggregate.updateRoleInfo(newName, newDescription);

      expect(aggregate.getRole().name).toBe(newName);
      expect(aggregate.getRole().description).toBe(newDescription);
    });

    it("应该更新角色类型", () => {
      const newType = RoleType.create("SYSTEM");
      aggregate.updateRoleType(newType);

      expect(aggregate.getRole().type.value).toBe(newType.value);
    });

    it("应该激活角色", () => {
      aggregate.activateRole();

      expect(aggregate.getRole().isActive).toBe(true);
    });

    it("应该停用角色", () => {
      aggregate.deactivateRole();

      expect(aggregate.getRole().isActive).toBe(false);
    });

    it("应该更新角色优先级", () => {
      const newPriority = 5;
      aggregate.updateRolePriority(newPriority);

      expect(aggregate.getRole().priority).toBe(newPriority);
    });
  });

  describe("权限管理", () => {
    let aggregate: RoleAggregate;

    beforeEach(() => {
      aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该分配权限", () => {
      aggregate.assignPermission(validPermission);

      expect(aggregate.getPermissions()).toContain(validPermission);
      expect(aggregate.hasPermission(validPermission.id)).toBe(true);
    });

    it("应该移除权限", () => {
      aggregate.assignPermission(validPermission);
      aggregate.removePermission(validPermission.id);

      expect(aggregate.getPermissions()).not.toContain(validPermission);
      expect(aggregate.hasPermission(validPermission.id)).toBe(false);
    });

    it("应该批量分配权限", () => {
      const permissions = [
        validPermission,
        new Permission(
          TenantId.create("550e8400-e29b-41d4-a716-446655440003"),
          {
            name: "another-permission",
            description: "Another permission",
            type: PermissionType.create("TENANT"),
            action: PermissionAction.create("WRITE"),
            isSystemPermission: false,
            isEditable: true,
            resource: "another-resource",
            resourceId: undefined,
            conditions: {},
            parentPermissionId: undefined,
            priority: 1,
            isActive: true,
          },
          validAuditInfo,
        ),
      ];

      aggregate.assignPermissions(permissions);

      expect(aggregate.getPermissions()).toHaveLength(2);
    });

    it("应该清空权限", () => {
      aggregate.assignPermission(validPermission);
      aggregate.clearPermissions();

      expect(aggregate.getPermissions()).toHaveLength(0);
    });

    it("应该防止分配未激活的权限", () => {
      const inactivePermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440004"),
        {
          name: "inactive-permission",
          description: "Inactive permission",
          type: PermissionType.create("TENANT"),
          action: PermissionAction.create("READ"),
          isSystemPermission: false,
          isEditable: true,
          resource: "inactive-resource",
          resourceId: undefined,
          conditions: {},
          parentPermissionId: undefined,
          priority: 1,
          isActive: false, // 未激活
        },
        validAuditInfo,
      );

      expect(() => {
        aggregate.assignPermission(inactivePermission);
      }).toThrow("权限未激活，无法分配");
    });
  });

  describe("子角色管理", () => {
    let aggregate: RoleAggregate;
    let childRole: Role;

    beforeEach(() => {
      aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );

      childRole = new Role(
        TenantId.create("550e8400-e29b-41d4-a716-446655440005"),
        {
          name: "child-role",
          description: "Child role",
          type: RoleType.create("TENANT"),
          permissionType: PermissionType.create("TENANT"),
          actions: [PermissionAction.create("READ")],
          priority: 1,
          parentRoleId: validRole.id,
          tags: ["child"],
          config: {},
          isActive: true,
        },
        validAuditInfo,
      );
    });

    it("应该创建子角色", () => {
      aggregate.createChildRole(childRole);

      expect(aggregate.getChildRoles()).toContain(childRole);
      expect(aggregate.getRoleHierarchyDepth()).toBe(1);
    });

    it("应该移除子角色", () => {
      aggregate.createChildRole(childRole);
      aggregate.removeChildRole(childRole.id);

      expect(aggregate.getChildRoles()).not.toContain(childRole);
      expect(aggregate.getRoleHierarchyDepth()).toBe(0);
    });

    it("应该防止设置自己为子角色", () => {
      expect(() => {
        aggregate.createChildRole(validRole);
      }).toThrow("角色不能设置自己为子角色");
    });

    it("应该防止重复添加子角色", () => {
      aggregate.createChildRole(childRole);

      expect(() => {
        aggregate.createChildRole(childRole);
      }).toThrow("子角色已存在");
    });
  });

  describe("权限检查", () => {
    let aggregate: RoleAggregate;

    beforeEach(() => {
      aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该检查是否可以执行指定动作", () => {
      aggregate.assignPermission(validPermission);

      expect(
        aggregate.canExecute(PermissionAction.create("READ"), "test-resource"),
      ).toBe(true);
      expect(
        aggregate.canExecute(PermissionAction.create("WRITE"), "test-resource"),
      ).toBe(false);
    });

    it("应该检查是否可以管理", () => {
      const adminPermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440006"),
        {
          name: "admin-permission",
          description: "Admin permission",
          type: PermissionType.create("SYSTEM"),
          action: PermissionAction.create("ADMIN"),
          isSystemPermission: true,
          isEditable: false,
          resource: "admin-resource",
          resourceId: undefined,
          conditions: {},
          parentPermissionId: undefined,
          priority: 1,
          isActive: true,
        },
        validAuditInfo,
      );

      aggregate.assignPermission(adminPermission);

      expect(aggregate.canManage()).toBe(true);
    });

    it("应该获取所有权限描述", () => {
      aggregate.assignPermission(validPermission);

      const descriptions = aggregate.getPermissionDescriptions();
      expect(descriptions).toContain("Test permission description");
    });
  });

  describe("验证规则", () => {
    let aggregate: RoleAggregate;

    beforeEach(() => {
      aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该验证角色类型不能为空", () => {
      expect(() => {
        aggregate.updateRoleType(null as any);
      }).toThrow("角色类型不能为空");
    });

    it("应该防止停用有子角色的角色", () => {
      const childRole = new Role(
        TenantId.create("550e8400-e29b-41d4-a716-446655440007"),
        {
          name: "child-role",
          description: "Child role",
          type: RoleType.create("TENANT"),
          permissionType: PermissionType.create("TENANT"),
          actions: [PermissionAction.create("READ")],
          priority: 1,
          parentRoleId: validRole.id,
          tags: ["child"],
          config: {},
          isActive: true,
        },
        validAuditInfo,
      );

      aggregate.createChildRole(childRole);

      expect(() => {
        aggregate.deactivateRole();
      }).toThrow("有子角色的角色不能停用");
    });

    it("应该防止系统角色清空权限", () => {
      // 创建一个系统角色
      const systemRole = new Role(
        TenantId.create("550e8400-e29b-41d4-a716-446655440008"),
        {
          name: "system-role",
          description: "System role",
          type: RoleType.create("SYSTEM"),
          permissionType: PermissionType.create("SYSTEM"),
          actions: [PermissionAction.create("ADMIN")],
          priority: 1,
          parentRoleId: undefined,
          tags: ["system"],
          config: {},
          isActive: true,
        },
        validAuditInfo,
      );

      const systemAggregate = new RoleAggregate(
        validEntityId,
        systemRole,
        validAuditInfo,
        mockLogger,
      );

      expect(() => {
        systemAggregate.clearPermissions();
      }).toThrow("系统角色不能清空权限");
    });
  });

  describe("性能测试", () => {
    it("应该处理大量权限", () => {
      const aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const permission = new Permission(
          TenantId.create(
            `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          ),
          {
            name: `permission-${i}`,
            description: `Permission ${i}`,
            type: PermissionType.READ,
            action: PermissionAction.READ,
            resource: `resource-${i}`,
            resourceId: undefined,
            conditions: {},
            parentPermissionId: undefined,
            priority: i,
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.assignPermission(permission);
      }
      const endTime = Date.now();

      expect(aggregate.getPermissions()).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该处理大量子角色", () => {
      const aggregate = new RoleAggregate(
        validEntityId,
        validRole,
        validAuditInfo,
        mockLogger,
      );

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const childRole = new Role(
          TenantId.create(
            `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          ),
          {
            name: `child-role-${i}`,
            description: `Child role ${i}`,
            type: RoleType.TENANT,
            permissionType: PermissionType.TENANT,
            actions: [PermissionAction.READ],
            priority: i,
            parentRoleId: validRole.id,
            tags: [`child-${i}`],
            config: {},
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.createChildRole(childRole);
      }
      const endTime = Date.now();

      expect(aggregate.getRoleHierarchyDepth()).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
