import { EntityId, TenantId } from "@hl8/isolation-model";
import { PermissionAggregate } from "./permission-aggregate.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("PermissionAggregate", () => {
  let validEntityId: EntityId;
  let validPermission: Permission;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
    validAuditInfo = {
      createdBy: "test-user",
    };

    validPermission = new Permission(
      TenantId.create("550e8400-e29b-41d4-a716-446655440001"),
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
    it("应该成功创建权限聚合根", () => {
      const aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );

      expect(aggregate).toBeDefined();
      expect(aggregate.getPermission()).toBe(validPermission);
      expect(aggregate.getChildPermissions()).toEqual([]);
    });
  });

  describe("权限管理", () => {
    let aggregate: PermissionAggregate;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该更新权限信息", () => {
      const newName = "new-permission-name";
      const newDescription = "New permission description";

      aggregate.updatePermissionInfo(newName, newDescription);

      expect(aggregate.getPermission().name).toBe(newName);
      expect(aggregate.getPermission().description).toBe(newDescription);
    });

    it("应该更新权限类型", () => {
      const newType = PermissionType.create("TENANT");
      aggregate.updatePermissionType(newType);

      expect(aggregate.getPermission().type.value).toBe(newType.value);
    });

    it("应该更新权限动作", () => {
      const newAction = PermissionAction.create("UPDATE");
      aggregate.updatePermissionAction(newAction);

      expect(aggregate.getPermission().action.value).toBe(newAction.value);
    });

    it("应该更新资源标识", () => {
      const newResource = "new-resource";
      aggregate.updateResource(newResource);

      expect(aggregate.getPermission().resource).toBe(newResource);
    });

    it("应该设置资源ID", () => {
      const resourceId = TenantId.create(
        "550e8400-e29b-41d4-a716-446655440003",
      );
      aggregate.setResourceId(resourceId);

      expect(aggregate.getPermission().resourceId).toBe(resourceId);
    });

    it("应该移除资源ID", () => {
      const resourceId = TenantId.create(
        "550e8400-e29b-41d4-a716-446655440003",
      );
      aggregate.setResourceId(resourceId);
      aggregate.removeResourceId();

      expect(aggregate.getPermission().resourceId).toBeUndefined();
    });

    it("应该激活权限", () => {
      aggregate.activatePermission();

      expect(aggregate.getPermission().isActive).toBe(true);
    });

    it("应该停用权限", () => {
      aggregate.deactivatePermission();

      expect(aggregate.getPermission().isActive).toBe(false);
    });

    it("应该更新权限优先级", () => {
      const newPriority = 5;
      aggregate.updatePermissionPriority(newPriority);

      expect(aggregate.getPermission().priority).toBe(newPriority);
    });
  });

  describe("父权限管理", () => {
    let aggregate: PermissionAggregate;
    let parentPermission: Permission;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );

      parentPermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440004"),
        {
          name: "parent-permission",
          description: "Parent permission",
          type: PermissionType.create("SYSTEM"),
          action: PermissionAction.create("ADMIN"),
          isSystemPermission: true,
          isEditable: false,
          resource: "parent-resource",
          resourceId: undefined,
          conditions: {},
          parentPermissionId: undefined,
          priority: 1,
          isActive: true,
        },
        validAuditInfo,
      );
    });

    it("应该设置父权限", () => {
      aggregate.setParentPermission(parentPermission.id);

      expect(aggregate.getPermission().parentPermissionId).toBe(
        parentPermission.id,
      );
    });

    it("应该移除父权限", () => {
      aggregate.setParentPermission(parentPermission.id);
      aggregate.removeParentPermission();

      expect(aggregate.getPermission().parentPermissionId).toBeUndefined();
    });

    it("应该防止设置自己为父权限", () => {
      expect(() => {
        aggregate.setParentPermission(validPermission.id);
      }).toThrow("权限不能设置自己为父权限");
    });
  });

  describe("条件管理", () => {
    let aggregate: PermissionAggregate;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该添加条件", () => {
      const key = "department";
      const value = "IT";

      aggregate.addCondition(key, value);

      expect(aggregate.getPermission().conditions).toHaveProperty(key, value);
    });

    it("应该移除条件", () => {
      const key = "department";
      const value = "IT";

      aggregate.addCondition(key, value);
      aggregate.removeCondition(key);

      expect(aggregate.getPermission().conditions).not.toHaveProperty(key);
    });
  });

  describe("子权限管理", () => {
    let aggregate: PermissionAggregate;
    let childPermission: Permission;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );

      childPermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440005"),
        {
          name: "child-permission",
          description: "Child permission",
          type: PermissionType.create("TENANT"),
          action: PermissionAction.create("READ"),
          isSystemPermission: false,
          isEditable: true,
          resource: "child-resource",
          resourceId: undefined,
          conditions: {},
          parentPermissionId: validPermission.id,
          priority: 1,
          isActive: true,
        },
        validAuditInfo,
      );
    });

    it("应该创建子权限", () => {
      aggregate.createChildPermission(childPermission);

      expect(aggregate.getChildPermissions()).toContain(childPermission);
      expect(aggregate.getPermissionHierarchyDepth()).toBe(1);
    });

    it("应该移除子权限", () => {
      aggregate.createChildPermission(childPermission);
      aggregate.removeChildPermission(childPermission.id);

      expect(aggregate.getChildPermissions()).not.toContain(childPermission);
      expect(aggregate.getPermissionHierarchyDepth()).toBe(0);
    });

    it("应该防止设置自己为子权限", () => {
      expect(() => {
        aggregate.createChildPermission(validPermission);
      }).toThrow("权限不能设置自己为子权限");
    });

    it("应该防止重复添加子权限", () => {
      aggregate.createChildPermission(childPermission);

      expect(() => {
        aggregate.createChildPermission(childPermission);
      }).toThrow("子权限已存在");
    });
  });

  describe("权限检查", () => {
    let aggregate: PermissionAggregate;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该检查是否可以访问指定资源", () => {
      expect(aggregate.canAccess("test-resource")).toBe(true);
      expect(aggregate.canAccess("other-resource")).toBe(false);
    });

    it("应该检查是否可以执行指定动作", () => {
      expect(aggregate.canExecute(PermissionAction.create("READ"))).toBe(true);
      expect(aggregate.canExecute(PermissionAction.create("WRITE"))).toBe(
        false,
      );
    });

    it("应该检查权限条件是否匹配", () => {
      aggregate.addCondition("department", "IT");

      expect(aggregate.matchesConditions({ department: "IT" })).toBe(true);
      expect(aggregate.matchesConditions({ department: "HR" })).toBe(false);
    });

    it("应该获取权限描述", () => {
      const description = aggregate.getPermissionDescription();
      expect(description).toBe("Test permission description");
    });
  });

  describe("验证规则", () => {
    let aggregate: PermissionAggregate;

    beforeEach(() => {
      aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该验证权限类型不能为空", () => {
      expect(() => {
        aggregate.updatePermissionType(null as any);
      }).toThrow("权限类型不能为空");
    });

    it("应该验证权限动作不能为空", () => {
      expect(() => {
        aggregate.updatePermissionAction(null as any);
      }).toThrow("权限动作不能为空");
    });

    it("应该防止停用有子权限的权限", () => {
      const childPermission = new Permission(
        TenantId.create("550e8400-e29b-41d4-a716-446655440006"),
        {
          name: "child-permission",
          description: "Child permission",
          type: PermissionType.create("TENANT"),
          action: PermissionAction.create("READ"),
          isSystemPermission: false,
          isEditable: true,
          resource: "child-resource",
          resourceId: undefined,
          conditions: {},
          parentPermissionId: validPermission.id,
          priority: 1,
          isActive: true,
        },
        validAuditInfo,
      );

      aggregate.createChildPermission(childPermission);

      expect(() => {
        aggregate.deactivatePermission();
      }).toThrow("有子权限的权限不能停用");
    });
  });

  describe("性能测试", () => {
    it("应该处理大量子权限", () => {
      const aggregate = new PermissionAggregate(
        validEntityId,
        validPermission,
        validAuditInfo,
        mockLogger,
      );

      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const childPermission = new Permission(
          TenantId.create(
            `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          ),
          {
            name: `child-permission-${i}`,
            description: `Child permission ${i}`,
            type: PermissionType.READ,
            action: PermissionAction.READ,
            resource: `child-resource-${i}`,
            resourceId: undefined,
            conditions: {},
            parentPermissionId: validPermission.id,
            priority: i,
            isActive: true,
          },
          validAuditInfo,
        );
        aggregate.createChildPermission(childPermission);
      }
      const endTime = Date.now();

      expect(aggregate.getPermissionHierarchyDepth()).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
