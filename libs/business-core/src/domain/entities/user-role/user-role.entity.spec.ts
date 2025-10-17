import { EntityId, UserId } from "@hl8/isolation-model";
import { UserRole, UserRoleProps } from "./user-role.entity.js";
import { IPartialAuditInfo } from "../base/audit-info.js";
import { IPureLogger } from "@hl8/pure-logger";

describe("UserRole", () => {
  let validEntityId: EntityId;
  let validUserId: UserId;
  let validRoleId: EntityId;
  let validProps: UserRoleProps;
  let validAuditInfo: IPartialAuditInfo;
  let mockLogger: IPureLogger;

  beforeEach(() => {
    validEntityId = EntityId.generate();
    validUserId = UserId.create("550e8400-e29b-41d4-a716-446655440000");
    validRoleId = EntityId.generate();

    validProps = {
      userId: validUserId,
      roleId: validRoleId,
      isActive: true,
      reason: "初始分配",
      assignedBy: validUserId,
      assignedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      config: { priority: 1, autoRenew: false },
    };

    validAuditInfo = {
      createdBy: "test-user",
    };

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
    it("应该成功创建用户角色关联实体", () => {
      const userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.id).toBe(validEntityId);
      expect(userRole.userId).toBe(validUserId);
      expect(userRole.roleId).toBe(validRoleId);
      expect(userRole.isActive).toBe(true);
      expect(userRole.reason).toBe("初始分配");
      expect(userRole.assignedBy).toBe(validUserId);
      expect(userRole.assignedAt).toBeDefined();
      expect(userRole.expiresAt).toBeDefined();
      expect(userRole.config).toEqual({ priority: 1, autoRenew: false });
    });

    it("应该使用默认值创建用户角色关联实体", () => {
      const minimalProps: UserRoleProps = {
        userId: validUserId,
        roleId: validRoleId,
        isActive: true,
      };

      const userRole = new UserRole(
        validEntityId,
        minimalProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.id).toBe(validEntityId);
      expect(userRole.userId).toBe(validUserId);
      expect(userRole.roleId).toBe(validRoleId);
      expect(userRole.isActive).toBe(true);
      expect(userRole.reason).toBeUndefined();
      expect(userRole.assignedBy).toBeUndefined();
      expect(userRole.assignedAt).toBeUndefined();
      expect(userRole.expiresAt).toBeUndefined();
      expect(userRole.config).toBeUndefined();
    });

    it("应该在无效属性时抛出异常", () => {
      const invalidProps: UserRoleProps = {
        userId: null as any,
        roleId: validRoleId,
        isActive: true,
      };

      expect(() => {
        new UserRole(validEntityId, invalidProps, validAuditInfo, mockLogger);
      }).toThrow();
    });
  });

  describe("激活和停用", () => {
    let userRole: UserRole;

    beforeEach(() => {
      userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该能够激活用户角色关联", () => {
      userRole.deactivate();
      expect(userRole.isActive).toBe(false);

      userRole.activate();
      expect(userRole.isActive).toBe(true);
    });

    it("应该能够停用用户角色关联", () => {
      expect(userRole.isActive).toBe(true);

      userRole.deactivate();
      expect(userRole.isActive).toBe(false);
    });

    it("应该记录激活操作", () => {
      userRole.deactivate();
      userRole.activate();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "用户角色关联已激活",
        expect.objectContaining({
          userRoleId: validEntityId.toString(),
          userId: validUserId.toString(),
          roleId: validRoleId.toString(),
        }),
      );
    });

    it("应该记录停用操作", () => {
      userRole.deactivate();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "用户角色关联已停用",
        expect.objectContaining({
          userRoleId: validEntityId.toString(),
          userId: validUserId.toString(),
          roleId: validRoleId.toString(),
        }),
      );
    });
  });

  describe("更新分配信息", () => {
    let userRole: UserRole;

    beforeEach(() => {
      userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
    });

    it("应该能够更新分配原因", () => {
      const newReason = "角色变更";
      userRole.updateReason(newReason);

      expect(userRole.reason).toBe(newReason);
    });

    it("应该能够更新分配者", () => {
      const newAssignedBy = UserId.create(
        "550e8400-e29b-41d4-a716-446655440001",
      );
      userRole.updateAssignedBy(newAssignedBy);

      expect(userRole.assignedBy).toBe(newAssignedBy);
    });

    it("应该能够更新过期时间", () => {
      const newExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60天后过期
      userRole.updateExpiresAt(newExpiresAt);

      expect(userRole.expiresAt).toBe(newExpiresAt);
    });

    it("应该能够更新配置", () => {
      const newConfig = { priority: 2, autoRenew: true, customField: "value" };
      userRole.updateConfig(newConfig);

      expect(userRole.config).toEqual(newConfig);
    });

    it("应该记录更新操作", () => {
      userRole.updateReason("新原因");

      expect(mockLogger.info).toHaveBeenCalledWith(
        "用户角色关联分配原因已更新",
        expect.objectContaining({
          userRoleId: validEntityId.toString(),
          newReason: "新原因",
        }),
      );
    });
  });

  describe("过期检查", () => {
    it("应该正确识别未过期的关联", () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 明天过期
      const props: UserRoleProps = {
        ...validProps,
        expiresAt: futureDate,
      };

      const userRole = new UserRole(
        validEntityId,
        props,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.isExpired()).toBe(false);
    });

    it("应该正确识别已过期的关联", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 昨天过期
      const props: UserRoleProps = {
        ...validProps,
        expiresAt: pastDate,
      };

      const userRole = new UserRole(
        validEntityId,
        props,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.isExpired()).toBe(true);
    });

    it("应该正确处理没有过期时间的关联", () => {
      const props: UserRoleProps = {
        ...validProps,
        expiresAt: undefined,
      };

      const userRole = new UserRole(
        validEntityId,
        props,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.isExpired()).toBe(false);
    });
  });

  describe("有效性检查", () => {
    it("应该正确识别有效的关联", () => {
      const userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.isValid()).toBe(true);
    });

    it("应该正确识别无效的关联（已停用）", () => {
      const userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
      userRole.deactivate();

      expect(userRole.isValid()).toBe(false);
    });

    it("应该正确识别无效的关联（已过期）", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const props: UserRoleProps = {
        ...validProps,
        expiresAt: pastDate,
      };

      const userRole = new UserRole(
        validEntityId,
        props,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.isValid()).toBe(false);
    });
  });

  describe("序列化", () => {
    it("应该正确序列化为JSON", () => {
      const userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
      const json = userRole.toJSON();

      expect(json).toEqual({
        id: validEntityId.toString(),
        userId: validUserId.toString(),
        roleId: validRoleId.toString(),
        isActive: true,
        reason: "初始分配",
        assignedBy: validUserId.toString(),
        assignedAt: validProps.assignedAt?.toISOString(),
        expiresAt: validProps.expiresAt?.toISOString(),
        config: { priority: 1, autoRenew: false },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("应该正确处理可选字段的序列化", () => {
      const minimalProps: UserRoleProps = {
        userId: validUserId,
        roleId: validRoleId,
        isActive: true,
      };

      const userRole = new UserRole(
        validEntityId,
        minimalProps,
        validAuditInfo,
        mockLogger,
      );
      const json = userRole.toJSON();

      expect(json.reason).toBeUndefined();
      expect(json.assignedBy).toBeUndefined();
      expect(json.assignedAt).toBeUndefined();
      expect(json.expiresAt).toBeUndefined();
      expect(json.config).toBeUndefined();
    });
  });

  describe("相等性比较", () => {
    it("应该正确比较相同ID的实体", () => {
      const userRole1 = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
      const userRole2 = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole1.equals(userRole2)).toBe(true);
    });

    it("应该正确比较不同ID的实体", () => {
      const userRole1 = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );
      const userRole2 = new UserRole(
        EntityId.generate(),
        validProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole1.equals(userRole2)).toBe(false);
    });

    it("应该正确处理null和undefined的比较", () => {
      const userRole = new UserRole(
        validEntityId,
        validProps,
        validAuditInfo,
        mockLogger,
      );

      expect(userRole.equals(null as any)).toBe(false);
      expect(userRole.equals(undefined as any)).toBe(false);
    });
  });

  describe("业务规则验证", () => {
    it("应该验证用户ID不能为空", () => {
      const invalidProps: UserRoleProps = {
        userId: null as any,
        roleId: validRoleId,
        isActive: true,
      };

      expect(() => {
        new UserRole(validEntityId, invalidProps, validAuditInfo, mockLogger);
      }).toThrow("用户ID不能为空");
    });

    it("应该验证角色ID不能为空", () => {
      const invalidProps: UserRoleProps = {
        userId: validUserId,
        roleId: null as any,
        isActive: true,
      };

      expect(() => {
        new UserRole(validEntityId, invalidProps, validAuditInfo, mockLogger);
      }).toThrow("角色ID不能为空");
    });

    it("应该验证过期时间不能早于分配时间", () => {
      const invalidProps: UserRoleProps = {
        ...validProps,
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 过期时间早于分配时间
      };

      expect(() => {
        new UserRole(validEntityId, invalidProps, validAuditInfo, mockLogger);
      }).toThrow("过期时间不能早于分配时间");
    });
  });
});
