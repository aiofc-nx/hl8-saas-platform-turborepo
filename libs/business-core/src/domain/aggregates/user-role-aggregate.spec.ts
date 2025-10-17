import { EntityId, TenantId, UserId } from "@hl8/isolation-model";
import { UserRoleAggregate } from "./user-role-aggregate.js";
import { UserRole } from "../entities/user-role/user-role.entity.js";
import { Role } from "../entities/role/role.entity.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { RoleType } from "../value-objects/types/role-type.vo.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("UserRoleAggregate", () => {
  let validEntityId: EntityId;
  let validUserRole: UserRole;
  let validRole: Role;
  let validPermission: Permission;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    validAuditInfo = {
      createdBy: "test-user",
    };

    validUserRole = new UserRole(
      TenantId.create("550e8400-e29b-41d4-a716-446655440001"),
      {
        userId: UserId.create("550e8400-e29b-41d4-a716-446655440002"),
        roleId: TenantId.create("550e8400-e29b-41d4-a716-446655440003"),
        reason: "Test assignment",
        assignedBy: UserId.create("550e8400-e29b-41d4-a716-446655440004"),
        expiresAt: undefined,
        config: {},
        isActive: true,
      },
      validAuditInfo,
    );

    validRole = new Role(
      TenantId.create("550e8400-e29b-41d4-a716-446655440003"),
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
      TenantId.create("550e8400-e29b-41d4-a716-446655440005"),
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
    it("应该成功创建用户角色关联聚合根", () => {
      const aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );

      expect(aggregate).toBeDefined();
      expect(aggregate.getUserRole()).toBe(validUserRole);
      expect(aggregate.getRoles()).toEqual([]);
      expect(aggregate.getPermissions()).toEqual([]);
    });
  });

  describe("角色分配", () => {
    let aggregate: UserRoleAggregate;

    beforeEach(() => {
      aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该分配角色", () => {
      const reason = "Test assignment";
      const assignedBy = UserId.create("550e8400-e29b-41d4-a716-446655440006");
      const expiresAt = new Date("2024-12-31T23:59:59Z");

      aggregate.assignRole(validRole, reason, assignedBy, expiresAt);

      expect(aggregate.getRoles()).toContain(validRole);
      expect(aggregate.hasRole(validRole.id)).toBe(true);
    });

    it("应该移除角色", () => {
      aggregate.assignRole(validRole);
      aggregate.removeRole(validRole.id);

      expect(aggregate.getRoles()).not.toContain(validRole);
      expect(aggregate.hasRole(validRole.id)).toBe(false);
    });

    it("应该批量分配角色", () => {
      const roles = [
        validRole,
        new Role(
          TenantId.create("550e8400-e29b-41d4-a716-446655440007"),
          {
            name: "another-role",
            description: "Another role",
            type: RoleType.create("TENANT"),
            permissionType: PermissionType.create("TENANT"),
            actions: [PermissionAction.create("WRITE")],
            priority: 1,
            parentRoleId: undefined,
            tags: ["another"],
            config: {},
            isActive: true,
          },
          validAuditInfo,
        ),
      ];

      aggregate.assignRoles(
        roles,
        "Batch assignment",
        UserId.create("550e8400-e29b-41d4-a716-446655440008"),
      );

      expect(aggregate.getRoles()).toHaveLength(2);
    });

    it("应该清空角色", () => {
      aggregate.assignRole(validRole);
      aggregate.clearRoles();

      expect(aggregate.getRoles()).toHaveLength(0);
    });

    it("应该防止分配未激活的角色", () => {
      const inactiveRole = new Role(
        TenantId.create("550e8400-e29b-41d4-a716-446655440009"),
        {
          name: "inactive-role",
          description: "Inactive role",
          type: RoleType.create("TENANT"),
          permissionType: PermissionType.create("TENANT"),
          actions: [PermissionAction.create("READ")],
          priority: 1,
          parentRoleId: undefined,
          tags: ["inactive"],
          config: {},
          isActive: false, // 未激活
        },
        validAuditInfo,
      );

      expect(() => {
        aggregate.assignRole(inactiveRole);
      }).toThrow("角色未激活，无法分配");
    });
  });

  describe("关联管理", () => {
    let aggregate: UserRoleAggregate;

    beforeEach(() => {
      aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该激活关联", () => {
      aggregate.activateAssociation();

      expect(aggregate.getUserRole().isActive).toBe(true);
    });

    it("应该停用关联", () => {
      aggregate.deactivateAssociation();

      expect(aggregate.getUserRole().isActive).toBe(false);
    });

    it("应该更新分配原因", () => {
      const newReason = "Updated assignment reason";
      aggregate.updateReason(newReason);

      expect(aggregate.getUserRole().reason).toBe(newReason);
    });

    it("应该设置过期时间", () => {
      const expiresAt = new Date("2024-12-31T23:59:59Z");
      aggregate.setExpiration(expiresAt);

      expect(aggregate.getUserRole().expiresAt).toBe(expiresAt);
    });

    it("应该移除过期时间", () => {
      const expiresAt = new Date("2024-12-31T23:59:59Z");
      aggregate.setExpiration(expiresAt);
      aggregate.removeExpiration();

      expect(aggregate.getUserRole().expiresAt).toBeUndefined();
    });

    it("应该更新配置", () => {
      const config = { department: "IT", level: "senior" };
      aggregate.updateConfig(config);

      expect(aggregate.getUserRole().config).toEqual(config);
    });
  });

  describe("权限检查", () => {
    let aggregate: UserRoleAggregate;

    beforeEach(() => {
      aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该检查是否有指定权限", () => {
      aggregate.getPermissions().push(validPermission);

      expect(aggregate.hasPermission(validPermission.id)).toBe(true);
    });

    it("应该检查是否可以执行指定动作", () => {
      aggregate.getPermissions().push(validPermission);

      expect(aggregate.canExecute("READ", "test-resource")).toBe(true);
      expect(aggregate.canExecute("WRITE", "test-resource")).toBe(false);
    });

    it("应该检查是否可以管理", () => {
      const adminPermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440010"),
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

      aggregate.getPermissions().push(adminPermission);

      expect(aggregate.canManage()).toBe(true);
    });

    it("应该检查关联是否有效", () => {
      expect(aggregate.isValid()).toBe(true);
    });

    it("应该检查关联是否过期", () => {
      const pastDate = new Date("2020-01-01T00:00:00Z");
      aggregate.setExpiration(pastDate);

      expect(aggregate.isExpired()).toBe(true);
    });

    it("应该获取所有权限描述", () => {
      aggregate.getPermissions().push(validPermission);

      const descriptions = aggregate.getPermissionDescriptions();
      expect(descriptions).toContain("Test permission description");
    });

    it("应该获取角色层级深度", () => {
      aggregate.assignRole(validRole);

      expect(aggregate.getRoleHierarchyDepth()).toBe(1);
    });
  });

  describe("验证规则", () => {
    let aggregate: UserRoleAggregate;

    beforeEach(() => {
      aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该验证角色不能为空", () => {
      expect(() => {
        aggregate.assignRole(null as any);
      }).toThrow("角色不能为空");
    });

    it("应该验证角色ID不能为空", () => {
      expect(() => {
        aggregate.removeRole(null as any);
      }).toThrow("角色ID不能为空");
    });

    it("应该验证角色列表不能为空", () => {
      expect(() => {
        aggregate.assignRoles([]);
      }).toThrow("角色列表不能为空");
    });
  });

  describe("性能测试", () => {
    it("应该处理大量角色", () => {
      const aggregate = new UserRoleAggregate(
        validEntityId,
        validUserRole,
        validAuditInfo,
        mockLogger,
      );

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const role = new Role(
          TenantId.create(
            `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          ),
          {
            name: `role-${i}`,
            description: `Role ${i}`,
            type: RoleType.TENANT,
            permissionType: PermissionType.TENANT,
            actions: [PermissionAction.READ],
            priority: i,
            parentRoleId: undefined,
            tags: [`role-${i}`],
            config: {},
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.assignRole(role);
      }
      const endTime = Date.now();

      expect(aggregate.getRoles()).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
